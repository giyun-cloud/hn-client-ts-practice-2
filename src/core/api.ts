import { NewsDetail, NewsFeed } from "../types";

class Api {
  url: string;
  ajax: XMLHttpRequest;

  constructor(url: string) {
    this.url = url
    this.ajax = new XMLHttpRequest();
  }

  async getRequest<AjaxResponse>(): Promise<AjaxResponse> {
    const response = await fetch(this.url)
    return await response.json()
  }
}

export class NewsFeedApi extends Api {
  constructor(url: string) {
    super(url);
  }

  async getData(): Promise<NewsFeed[]> {
    return this.getRequest<NewsFeed[]>();
  }
}

export class NewsDetailApi extends Api {
  constructor(url: string) {
    super(url);
  }

  async getData(): Promise<NewsDetail> {
    return this.getRequest<NewsDetail>();
  }
}
