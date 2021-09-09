interface Store {
  feeds: NewsFeed[];
  currentPage: number;
}

interface News {
  readonly id: number;
  readonly time_ago: string;
  readonly title: string;
  readonly url: string;
  readonly user: string;
  readonly content: string;
}

interface NewsFeed extends News {
  readonly points: number;
  readonly comments_count: number;
  read?: boolean;
}

interface NewsDetail extends News {
  readonly comments: NewsComment[];
}

interface NewsComment extends News {
  readonly comments: NewsComment[];
  readonly level: number;
}

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const store: Store = {
  currentPage: 1,
  feeds: [],
};

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

class NewsFeedApi {
  getData(url:string): NewsFeed[] {
    return this.getRequest<NewsFeed[]>(url);
  }
}

class NewsDetailApi {
  getData(url:string): NewsDetail {
    return this.getRequest<NewsDetail>(url);
  }
}

interface NewsFeedApi extends Api {};
interface NewsDetailApi extends Api {};

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);

class View {
  container: HTMLElement;
  template: string;
  renderTemplate: string;
  htmlList: string[];

  constructor(containerId: string, template: string) {
    const containerEl = document.getElementById(containerId)
    
    if(!containerEl) {
      throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.'
    }

    this.template = template
    this.renderTemplate = template
    this.htmlList = [];
    this.container = containerEl;
  }

  updateView(): void {
    this.container.innerHTML = this.template;
  }

  addHtml(html: string): void {
    this.htmlList.push(html)
  }

  getHtml(): string {
    const snapShot = this.htmlList.join();
    this.clearHtmlList();
    return snapShot
  }

  setTemplateData(key: string, value: string): void {
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value)
  }

  clearHtmlList(): void {
    this.htmlList = [];
  }
}

class Router {
  constructor() {
    window.addEventListener("hashchange", router);
    const routePath = location.hash;

    if (routePath === "") {
      newsFeed();
    } else if (routePath.indexOf("#/page/") >= 0) {
      store.currentPage = Number(routePath.substr(7));
      newsFeed();
    } else {
      newsDetail();
    }
  }
}

class NewsFeedView extends View {
  api: NewsFeedApi;
  feeds: NewsFeed[]
  constructor(containerId: string) {
    let template = `
    <div class="bg-gray-600 min-h-screen">
    <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                  Previous
                </a>
                <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                  Next
                </a>
              </div>
            </div> 
          </div>
        </div>
        <div class="p-4 text-2xl text-gray-700">
          {{__news_feed__}}        
        </div>
      </div>
    `;
    super(containerId,template)
    this.api = new NewsFeedApi()
    this.feeds = store.feeds;
    
    if (this.feeds.length === 0) {
      this.feeds = store.feeds = this.makeFeeds(this.api.getData(NEWS_URL));
    }    
  }

  render() {
    const newsList = [];
    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
      const {read,        id,        title,        comments_count,        user,        points,        time_ago} = this.feeds[i]
      newsList.push(`
        <div class="p-6 ${
          read ? "bg-green-500" : "bg-white"
        } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
          <div class="flex">
            <div class="flex-auto">
              <a href="#/show/${id}">${title}</a>  
            </div>
            <div class="text-center text-sm">
              <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
                comments_count
              }</div>
            </div>
          </div>
          <div class="flex mt-3">
            <div class="grid grid-cols-3 text-sm text-gray-500">
              <div><i class="fas fa-user mr-1"></i>${user}</div>
              <div><i class="fas fa-heart mr-1"></i>${points}</div>
              <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
            </div>  
          </div>
        </div>    
      `);
    }

    this.setTemplateData("news_feed", this.getHtml());
    this.setTemplateData("prev_page",String(store.currentPage > 1 ? store.currentPage - 1 : 1));
    this.setTemplateData("{{__next_page__}}", String(store.currentPage + 1));

    this.updateView();
  }

  makeFeeds(feeds: NewsFeed[]):  NewsFeed[] {
    for (let i = 0; i < feeds.length; i++) {
      feeds[i].read = false;
    }
  
    return feeds;
  }
}

class NewsDetailView extends View {
  constructor(containerId: string) {
    let template = `
      <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/{{__current_page__}}" class="text-gray-500">
                  <i class="fa fa-times"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
          <h2>{{__title__}}</h2>
          <div class="text-gray-400 h-20">
            {{__content__}}
          </div>

          {{__comments__}}

        </div>
      </div>
    `; 
    super(containerId,template)  
  }

  render() {
    const id = location.hash.substr(7);
    const api = new NewsDetailApi()
    const newsContent: NewsDetail = api.getData(CONTENT_URL.replace("@id", id));
    for (let i = 0; i < store.feeds.length; i++) {
      if (store.feeds[i].id === Number(id)) {
        store.feeds[i].read = true;
        break;
      }
    }

    this.setTemplateData("comments",this.makeComment(newsContent.comments))
    this.setTemplateData("content",newsContent.content)
    this.setTemplateData("title",newsContent.title)
    this.setTemplateData("current_page",String(store.currentPage))
    
    this.updateView()
  }

  makeComment(comments: NewsComment[]): string {
    const commentString = [];
  
    for (let i = 0; i < comments.length; i++) {
      const comment : NewsComment = comments[i]
      commentString.push(`
        <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>      
      `);
  
      if (comment.comments.length > 0) {
        commentString.push(this.makeComment(comment.comments));
      }
    }
  
    return commentString.join("");
  }
}

const router: Router = new Router();
const newFeedView: NewsFeedView = new NewsFeedView('root');
const newDetailView: NewsDetailView = new NewsDetailView('root');

router.setDefaultPage(newFeedView);

router.addRoutePath('/page/', newFeedView);
router.addRoutePath('/show/', newDetailView);

