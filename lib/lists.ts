import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface ListItem {
  id: string;
  name: string;
  address?: string;
  city?: string;
  category?: string;
  notes?: string;
  done: boolean;
  lat?: number;
  long?: number;
  createdAt: Date;
  lastModifiedAt: Date;
  listId: string;
}

export interface List {
  id: string;
  name: string;
  ownerName: string;
  ownerId: string;
  items: ListItem[];
  createdAt: Date;
  lastModifiedAt: Date;
  isShared: boolean;
  collaborators: string[];
  permissions: Record<string, string>;
}

export async function getListById(listId: string): Promise<List | null> {
  try {
    // First, get the list document
    const listDoc = doc(db, "lists", listId);
    const listSnapshot = await getDoc(listDoc);

    if (!listSnapshot.exists()) {
      return null;
    }

    const listData = listSnapshot.data();

    // Get items from the list's subcollection
    const itemsRef = collection(db, "lists", listId, "items");
    const itemsSnapshot = await getDocs(itemsRef);

    const items: ListItem[] = [];
    itemsSnapshot.forEach((doc) => {
      const itemData = doc.data();
      items.push({
        id: doc.id,
        name: itemData.name || "Untitled Item",
        address: itemData.address || "",
        city: itemData.city || "",
        category: itemData.category || "None",
        notes: itemData.notes || "",
        done: itemData.done || false,
        lat: itemData.lat || null,
        long: itemData.long || null,
        createdAt: itemData.createdAt?.toDate() || new Date(),
        lastModifiedAt: itemData.lastModifiedAt?.toDate() || new Date(),
        listId: itemData.listId,
      });
    });

    // Transform the data to match our interface
    const list: List = {
      id: listSnapshot.id,
      name: listData.name || "Untitled List",
      ownerName: listData.ownerName || "Unknown",
      ownerId: listData.ownerId || "",
      items: items,
      createdAt: listData.createdAt?.toDate() || new Date(),
      lastModifiedAt: listData.lastModifiedAt?.toDate() || new Date(),
      isShared: listData.isShared || false,
      collaborators: listData.collaborators || [],
      permissions: listData.permissions || {},
    };

    return list;
  } catch (error) {
    console.error("Error fetching list:", error);
    return null;
  }
}

export async function getPublicLists(): Promise<List[]> {
  try {
    const listsRef = collection(db, "lists");
    const q = query(listsRef, where("isShared", "==", true));
    const querySnapshot = await getDocs(q);

    const lists: List[] = [];

    // For each shared list, fetch its items
    for (const listDoc of querySnapshot.docs) {
      const listData = listDoc.data();
      const listId = listDoc.id;

      // Get items from the list's subcollection
      const itemsRef = collection(db, "lists", listId, "items");
      const itemsSnapshot = await getDocs(itemsRef);

      const items: ListItem[] = [];
      itemsSnapshot.forEach((doc) => {
        const itemData = doc.data();
        items.push({
          id: doc.id,
          name: itemData.name || "Untitled Item",
          address: itemData.address || "",
          city: itemData.city || "",
          category: itemData.category || "None",
          notes: itemData.notes || "",
          done: itemData.done || false,
          lat: itemData.lat || null,
          long: itemData.long || null,
          createdAt: itemData.createdAt?.toDate() || new Date(),
          lastModifiedAt: itemData.lastModifiedAt?.toDate() || new Date(),
          listId: itemData.listId,
        });
      });

      lists.push({
        id: listDoc.id,
        name: listData.name || "Untitled List",
        ownerName: listData.ownerName || "Unknown",
        ownerId: listData.ownerId || "",
        items: items,
        createdAt: listData.createdAt?.toDate() || new Date(),
        lastModifiedAt: listData.lastModifiedAt?.toDate() || new Date(),
        isShared: listData.isShared || false,
        collaborators: listData.collaborators || [],
        permissions: listData.permissions || {},
      });
    }

    return lists;
  } catch (error) {
    console.error("Error fetching public lists:", error);
    return [];
  }
}

export function calculateProgress(list: List): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = list.items.length;
  const completed = list.items.filter((item) => item.done).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}
