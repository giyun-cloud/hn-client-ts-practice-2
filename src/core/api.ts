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
  getRequest<AjaxResponse>(url: string, cb: (data:AjaxResponse) => void ): void {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url);
    ajax.addEventListener('load', () => {
      cb(JSON.parse(ajax.response) as AjaxResponse);
    })
    ajax.send();
  }

  getRequestWithFetch<AjaxResponse>(url: string, cb: (data:AjaxResponse) => void ): void {
    fetch(url)
      .then(res => res.json())
      .then(cb)
      .catch(() => {console.error("데이터를 불러오지 못했습니다.")})
  }
}

export class NewsFeedApi {
  getData(url:string, cb: (data:NewsFeed[]) => void): void {
    this.getRequestWithFetch<NewsFeed[]>(url,cb);
  }
}

export class NewsDetailApi {
  getData(url:string, cb: (data:NewsDetail) => void): void {
    this.getRequestWithFetch<NewsDetail>(url,cb);
  }
}

export interface NewsFeedApi extends Api {};
export interface NewsDetailApi extends Api {};

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);
