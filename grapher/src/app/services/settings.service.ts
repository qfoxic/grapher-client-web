import { Injectable } from '@angular/core';


const STORAGE_TYPE = 'localStorage';
const PREFIX = 'grapher';
const VIEWS_KEY = 'views';


export class ViewSettings {
  // Title will be displayed in a toolbar.
  title: string;

  // Used as an id field;
  name: string;

  static isComplete(obj: any): obj is ViewSettings {
    return obj.title !== undefined && obj.name !== undefined;
  }

  constructor(data: Object) {
    this.title = data['title'];
    this.name = data['name'];
  }
}


@Injectable({
  providedIn: 'root'
})
export class GrapherSettingsService {

  private storage: Storage;
  private prefix: string;
  private views: Array<ViewSettings>;

  constructor() {
    this.storage = window[STORAGE_TYPE];
    this.prefix = PREFIX;
    this.views = [];
  }

  public getViews(): Array<ViewSettings> {
    try {
      const items = JSON.parse(this.storage.getItem(this.formatKey(VIEWS_KEY)));
      for (const item of items) {
        if (ViewSettings.isComplete(item)) {
          this.views.push(new ViewSettings(item));
        }
      }
      return this.views;
    } catch (e) {
      return [];
    }
  }

  public set(key: string, value: any): boolean {
    if (!value) {
      return false;
    }

    value = JSON.stringify(value);

    try {
      this.storage.setItem(this.formatKey(key), value);
    } catch (e) {
      return false;
    }
    return true;
  }

  public formatKey(key: string): string {
    return `${this.prefix}${key}`;
  }

}
