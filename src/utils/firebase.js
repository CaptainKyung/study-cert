import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, addDoc, getDocs,
  updateDoc, doc, query, orderBy, serverTimestamp,
  where, deleteDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'firebase/auth';

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
export const auth = getAuth(app);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function registerUser({ email, password, name, avatar }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await addDoc(collection(db, 'users'), {
    uid: cred.user.uid,
    email, name, avatar,
    role: 'user',
    createdAt: serverTimestamp(),
  });
  return cred.user;
}

export async function loginUser({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function fetchUserProfile(uid) {
  const snapshot = await getDocs(collection(db, 'users'));
  const userDoc = snapshot.docs.find(d => d.data().uid === uid);
  if (!userDoc) return null;
  return { id: userDoc.id, ...userDoc.data() };
}

export async function fetchAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateUserProfile(uid, updates) {
  const snapshot = await getDocs(collection(db, 'users'));
  const userDoc = snapshot.docs.find(d => d.data().uid === uid);
  if (!userDoc) return;
  await updateDoc(doc(db, 'users', userDoc.id), updates);
}

export async function deleteUser(uid) {
  const snapshot = await getDocs(collection(db, 'users'));
  const userDoc = snapshot.docs.find(d => d.data().uid === uid);
  if (userDoc) await deleteDoc(doc(db, 'users', userDoc.id));
}

// ─── Posts ────────────────────────────────────────────────────────────────────

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

// ─── Groups ───────────────────────────────────────────────────────────────────

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
// ─── Todo ─────────────────────────────────────────────────────────────────────

/** 특정 날짜 투두 불러오기 */
export async function fetchTodos(userId, date) {
  const q = query(
    collection(db, 'todos'),
    where('userId', '==', userId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** 투두 추가 */
export async function addTodo(userId, date, text) {
  const docRef = await addDoc(collection(db, 'todos'), {
    userId, date, text,
    done: false,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, userId, date, text, done: false };
}

/** 투두 완료/미완료 토글 */
export async function toggleTodo(todoId, done) {
  await updateDoc(doc(db, 'todos', todoId), { done: !done });
}

/** 투두 삭제 */
export async function deleteTodo(todoId) {
  await deleteDoc(doc(db, 'todos', todoId));
}
// ─── Account Management ───────────────────────────────────────────────────────
import {
  updateEmail, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';

/** 비밀번호 변경 */
export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

/** 이메일 변경 */
export async function changeEmail(currentPassword, newEmail) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updateEmail(user, newEmail);
  await updateUserProfile(user.uid, { email: newEmail });
}

/** 계정 삭제 */
export async function deleteAccount(password) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  const snapshot = await getDocs(collection(db, 'users'));
  const userDoc = snapshot.docs.find(d => d.data().uid === user.uid);
  if (userDoc) await deleteDoc(doc(db, 'users', userDoc.id));
  await firebaseDeleteUser(user);
}
// ─── Comments ─────────────────────────────────────────────────────────────────

/** 댓글 불러오기 */
export async function fetchComments(postId) {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** 댓글 추가 */
export async function addComment(postId, userId, userName, userAvatar, text) {
  const docRef = await addDoc(collection(db, 'comments'), {
    postId, userId, userName, userAvatar, text,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, postId, userId, userName, userAvatar, text };
}

/** 댓글 삭제 */
export async function deleteComment(commentId) {
  await deleteDoc(doc(db, 'comments', commentId));
}
