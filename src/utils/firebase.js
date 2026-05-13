import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, addDoc, getDocs,
  updateDoc, doc, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDwQGVujWTa1-9Okx6-PwJ7A0N-CL-Msmg",
  authDomain: "study-cert-a9792.firebaseapp.com",
  projectId: "study-cert-a9792",
  storageBucket: "study-cert-a9792.firebasestorage.app",
  messagingSenderId: "850865972256",
  appId: "1:850865972256:web:0e929e3f245c922a2ec845"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function uploadImage(base64, postId) {
  const storageRef = ref(storage, `posts/${postId}.jpg`);
  await uploadString(storageRef, base64, 'data_url');
  return getDownloadURL(storageRef);
}

export async function createPost({ userId, userName, userAvatar, imageBase64, caption, date }) {
  const postId = `${userId}_${Date.now()}`;
  const imageUrl = await uploadImage(imageBase64, postId);
  const docRef = await addDoc(collection(db, 'posts'), {
    userId, userName, userAvatar, imageUrl, caption, date,
    likes: [], createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchPosts() {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function toggleLikeDB(postId, userId, currentLikes) {
  const already = currentLikes.includes(userId);
  const updated = already
    ? currentLikes.filter(id => id !== userId)
    : [...currentLikes, userId];
  await updateDoc(doc(db, 'posts', postId), { likes: updated });
  return updated;
}
import { deleteDoc } from 'firebase/firestore';
import { deleteObject } from 'firebase/storage';

// 게시물 삭제
export async function deletePost(postId, imageUrl) {
  await deleteDoc(doc(db, 'posts', postId));
  if (imageUrl) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (_) {}
  }
}

// 게시물 편집 (캡션 수정)
export async function editPost(postId, caption) {
  await updateDoc(doc(db, 'posts', postId), { caption });
}