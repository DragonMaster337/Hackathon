import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

/**
 * Pick an image from camera or gallery
 * @param {'camera' | 'gallery'} source
 * @returns {Promise<string|null>} local URI or null if cancelled
 */
export const pickImage = async (source = 'gallery') => {
  let result;

  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is needed to take photos');
      return null;
    }
    result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
    });
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Gallery permission is needed to select photos');
      return null;
    }
    result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.7,
    });
  }

  if (result.canceled || !result.assets?.[0]) return null;
  return result.assets[0].uri;
};

/**
 * Pick an image for event cover (16:9 aspect ratio)
 * @returns {Promise<string|null>} local URI or null if cancelled
 */
export const pickCoverImage = async () => {
  return new Promise((resolve) => {
    const doPickFromGallery = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Gallery permission is needed to select photos');
        resolve(null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.8,
      });
      resolve(result.canceled || !result.assets?.[0] ? null : result.assets[0].uri);
    };

    const doPickFromCamera = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Camera permission is needed to take photos');
        resolve(null);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });
      resolve(result.canceled || !result.assets?.[0] ? null : result.assets[0].uri);
    };

    Alert.alert('Add Cover Image', 'Choose a source', [
      { text: 'Camera', onPress: doPickFromCamera },
      { text: 'Gallery', onPress: doPickFromGallery },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
};

/**
 * Upload image to Supabase Storage
 * @param {string} uri - local file URI
 * @param {string} bucket - 'avatars' or 'event-images'
 * @param {string} path - storage path e.g. 'userId/avatar.jpg'
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export const uploadImage = async (uri, bucket, path) => {
  try {
    // Read the file as blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // Determine content type
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Upload error:', err);
    return { url: null, error: err.message };
  }
};

/**
 * Upload avatar for a user
 * @param {string} uri - local image URI
 * @param {string} userId - user's UUID
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export const uploadAvatar = async (uri, userId) => {
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar.${ext}`;
  return uploadImage(uri, 'avatars', path);
};

/**
 * Upload event cover image
 * @param {string} uri - local image URI
 * @param {string} userId - promoter's UUID
 * @param {string} eventId - event UUID (use a temp ID if creating)
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export const uploadEventCover = async (uri, userId, eventId) => {
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${eventId || Date.now()}.${ext}`;
  return uploadImage(uri, 'event-images', path);
};

/**
 * Upload a supporting document for a venue claim.
 * The claim-documents bucket is private, so this returns the storage path
 * rather than a public URL — admins generate signed URLs from the path.
 * @param {string} uri - local image URI
 * @param {string} userId - claimant's UUID
 * @param {string} eventId - event UUID being claimed
 * @param {number} index - position in the document list
 * @returns {Promise<{path: string|null, error: string|null}>}
 */
export const uploadClaimDocument = async (uri, userId, eventId, index = 0) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const path = `${userId}/${eventId}/${Date.now()}_${index}.${ext}`;

    const { data, error } = await supabase.storage
      .from('claim-documents')
      .upload(path, arrayBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Claim document upload error:', error);
      return { path: null, error: error.message };
    }

    return { path: data.path, error: null };
  } catch (err) {
    console.error('Claim document upload error:', err);
    return { path: null, error: err.message };
  }
};
