// Firebase
import { firestoreDB } from "./../../firebase";
// Schemas
import { AnimeItem, AnimeSeason } from "./animedb.schema";
import {
  WhereFilterOp,
  QueryDocumentData,
} from "../../firebase/firebase.schemas";
// Functions
import { FetchAnimeDB, FetchAnimeById } from "./animedb.function";
// Services
import { OngoingService } from "./../ongoing/ongoingService";

type FilterParams = Array<{
  by: string;
  entry: WhereFilterOp;
  dependencies: AnimeSeason | string;
}>;

export class AnimeDbService {
  private readonly ongoingService: OngoingService;
  constructor() {
    this.ongoingService = new OngoingService();
  }
  public async getAll(
    limit?: number,
    tags?: string,
    season?: AnimeSeason,
    page?: number
  ) {
    const limitter = limit ? (limit <= 30 ? limit : 30) : 10;
    const paginatedRef = await this.paginate(page ? page : 1, limitter);
    const animeDbRef = await this.censorshipAnimeFilter(paginatedRef);
    const refFiltered = await this.applyFilters(animeDbRef, tags, season);

    return await FetchAnimeDB(refFiltered, limitter, tags);
  }
  public async getOne(animeId: string): Promise<AnimeItem> {
    return new Promise(async (resolve, reject) => {
      try {
        const anime = await FetchAnimeById(animeId);
        anime && resolve(anime);
      } catch (error) {
        try {
          const ongoing = await this.ongoingService.getOngoingById(animeId, true);
          ongoing && resolve(ongoing);
        } catch (error) {
          reject("Anime not found");
        }
      }
    });
  }

  public async paginate(page: number, limit: number) {
    const _limit = page === 1 ? page * limit : Number(page * limit) - limit;
    const currentPage = await firestoreDB.collection("animedb").limit(_limit);

    const snapshot = await currentPage.get();
    // Step 2
    const lastDocumentSnapshot = snapshot.docs[snapshot.docs.length - 1];

    // Step 3
    const nextPage = await firestoreDB
      .collection("animedb")
      .limit(_limit)
      .startAfter(lastDocumentSnapshot);

    return page === 1 ? currentPage : nextPage;
  }

  private async censorshipAnimeFilter(dbRef?: QueryDocumentData) {
    const ref = dbRef ? dbRef : firestoreDB.collection("animedb");
    // Block anime with rating 18 +
    return await ref.where("unacceptable", "==", false);
  }
  private async applyFilters(
    dbRef: QueryDocumentData,
    tags?: string,
    season?: AnimeSeason
  ) {
    const filters: FilterParams = [
      tags && {
        by: "tags",
        entry: "array-contains-any",
        dependencies: JSON.parse(tags),
      },
      season && { by: "animeSeason.season", entry: "==", dependencies: season },
    ];

    return await filters.reduce((ref, filter) => {
      if (filter) {
        ref = ref.where(filter.by, filter.entry, filter.dependencies);
      }
      return ref;
    }, dbRef);
  }
}
