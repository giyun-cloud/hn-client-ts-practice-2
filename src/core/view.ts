export default abstract class View {
  private container: HTMLElement;
  private template: string;
  private renderTemplate: string;
  private htmlList: string[];

  constructor(containerId: string, template: string) {
    const containerEl = document.getElementById(containerId)
    
    if(!containerEl) {
      throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.'
    }

    this.container = containerEl;
    this.template = template
    this.renderTemplate = template
    this.htmlList = [];
  }

  protected updateView(): void {
    this.container.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template
  }

  protected addHtml(html: string): void {
    this.htmlList.push(html)
  }

  protected getHtml(): string {
    const snapShot = this.htmlList.join('');
    this.clearHtmlList();
    return snapShot
  }

  protected setTemplateData(key: string, value: string): void {
    this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value)
  }

  protected clearHtmlList(): void {
    this.htmlList = [];
  }

  abstract render(): void;
}