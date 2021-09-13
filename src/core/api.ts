import { NewsDetail, NewsFeed } from "../types";


function applyApiMixins(targetClass: any, baseClasses: any[]): void {
  baseClasses.forEach(baseClass => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);
      
      if (descriptor) {
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }            
    });
  });
}

class Api {
  getRequest<AjaxResponse>(url: string): AjaxResponse {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response) as AjaxResponse;
  }
}

export class NewsFeedApi {
  getData(url:string): NewsFeed[] {
    return this.getRequest<NewsFeed[]>(url);
  }
}

export class NewsDetailApi {
  getData(url:string): NewsDetail {
    return this.getRequest<NewsDetail>(url);
  }
}

export interface NewsFeedApi extends Api {};
export interface NewsDetailApi extends Api {};

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);
