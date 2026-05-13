import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, addDoc, getDocs,
  updateDoc, doc, query, orderBy, serverTimestamp,
  where, deleteDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

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

export async function deletePost(postId, imageUrl) {
  await deleteDoc(doc(db, 'posts', postId));
  if (imageUrl) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (_) {}
  }
}

export async function editPost(postId, caption) {
  await updateDoc(doc(db, 'posts', postId), { caption });
}

export async function createGroup({ name, userId, userName, userAvatar }) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const docRef = await addDoc(collection(db, 'groups'), {
    name, code,
    members: [{ userId, userName, userAvatar }],
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, code };
}

export async function joinGroup({ code, userId, userName, userAvatar }) {
  const q = query(collection(db, 'groups'), where('code', '==', code.toUpperCase()));
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error('존재하지 않는 코드예요');
  const groupDoc = snapshot.docs[0];
  const members = groupDoc.data().members;
  if (members.find(m => m.userId === userId)) throw new Error('이미 참여한 그룹이에요');
  await updateDoc(doc(db, 'groups', groupDoc.id), {
    members: [...members, { userId, userName, userAvatar }]
  });
  return { id: groupDoc.id, ...groupDoc.data() };
}

export async function fetchMyGroups(userId) {
  const snapshot = await getDocs(collection(db, 'groups'));
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(g => g.members.some(m => m.userId === userId));
}

export async function leaveGroup(groupId, userId) {
  const groupRef = doc(db, 'groups', groupId);
  const snapshot = await getDocs(collection(db, 'groups'));
  const group = snapshot.docs.find(d => d.id === groupId)?.data();
  if (!group) return;
  const updated = group.members.filter(m => m.userId !== userId);
  if (updated.length === 0) {
    await deleteDoc(groupRef);
  } else {
    await updateDoc(groupRef, { members: updated });
  }
}