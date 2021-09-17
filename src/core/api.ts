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
}

export class NewsFeedApi {
  getData(url:string, cb: (data:NewsFeed[]) => void): void {
    this.getRequest<NewsFeed[]>(url,cb);
  }
}

export class NewsDetailApi {
  getData(url:string, cb: (data:NewsDetail) => void): void {
    this.getRequest<NewsDetail>(url,cb);
  }
}

export interface NewsFeedApi extends Api {};
export interface NewsDetailApi extends Api {};

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);
