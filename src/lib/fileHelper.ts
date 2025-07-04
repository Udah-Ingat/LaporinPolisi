import { storage } from "@/server/db/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.replace(/^data:(.*,)?/, "");
      resolve(base64);
    };
    reader.onerror = () =>
      reject(new Error("Something went wrong when convert data to base 64"));
  });
};

export const uploadBase64Image = async (b64: string) => {
  const safeUuid = uuidv4 as () => string;
  const key = safeUuid();
  const filename = `${key}.jpg`;
  const storageRef = ref(storage, `uploads/${filename}`);

  const snapshot = await uploadString(storageRef, b64, "base64");
  const url = await getDownloadURL(snapshot.ref);
  return url;
};
