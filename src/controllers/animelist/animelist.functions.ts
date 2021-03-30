import {
  DocumentReference,
  UserAnime,
  UserAnimeList,
} from "./animelist.schema";
export const setAnimeList = (
  data: UserAnime,
  ref: DocumentReference,
  refData: UserAnimeList
) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!refData) {
        await ref.set(data);
      } else {
        await ref.update({
          ...refData,
          ...data,
        });
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
