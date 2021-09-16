import { CONTENT_URL } from "../config";
import { NewsDetailApi } from "../core/api";
import View from "../core/view";
import { NewsComment, NewsDetail, NewsStore } from "../types";

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

export default class NewsDetailView extends View {
  private store: NewsStore;
  constructor(containerId: string, store: NewsStore) {
    super(containerId,template);
    this.store = store
  }

  render() {
    console.log("detail 랜더실행")
    const id = location.hash.substr(7);
    const api = new NewsDetailApi()
    const newsContent: NewsDetail = api.getData(CONTENT_URL.replace("@id", id));
    this.store.makeRead(Number(id));

    this.setTemplateData("comments",this.makeComment(newsContent.comments))
    this.setTemplateData("content",newsContent.content)
    this.setTemplateData("title",newsContent.title)
    this.setTemplateData("current_page",String(this.store.currentPage))
    
    this.updateView()
  }

  makeComment(comments: NewsComment[]): string {
    for (let i = 0; i < comments.length; i++) {
      const comment : NewsComment = comments[i]
      this.addHtml(`
        <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comment.user}</strong> ${comment.time_ago}
          </div>
          <p class="text-gray-700">${comment.content}</p>
        </div>      
      `);
  
      if (comment.comments.length > 0) {
        this.addHtml(this.makeComment(comment.comments));
      }
    }
  
    return this.getHtml();
  }
}