import { NewsFeed, NewsStore } from "./types";

export class Store implements NewsStore {
  feeds: NewsFeed[];
  _currentPage: number;

  constructor() {
    this.feeds = [];
    this._currentPage = 1;
  }

  get currentPage(): number {
    return this._currentPage
  }

  set currentPage(page: number) {
    this._currentPage = page;
  }

  get nextPage(): number {
    return this._currentPage + 1;
  }

  get prevPage(): number {
    return this._currentPage - 1 < 1 ? 1 : this._currentPage -1;
  }

  get numberOfFeeds(): number {
    return this.feeds.length;
  }

  get hasFeeds(): boolean {
    return this.feeds.length > 0;
  }

  getAllFeeds(): NewsFeed[] {
    return this.feeds
  }

  getFeed(position: number): NewsFeed {
    return this.feeds[position]
  }

  setFeeds(feeds: NewsFeed[]): void {
    this.feeds = feeds.map(feed => ({
      ...feed,
      read: false,
    }))
  }

  makeRead(id: number): void {
    this.feeds.filter(feed => feed.id === id)[0].read = true;
  }
}