import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


const STORAGE_TYPE = 'localStorage';
const PREFIX = 'grapher';
const DIAGRAMS_KEY = 'diagrams';


export class DiagramSettings {
  // Title will be displayed in a toolbar.
  readonly title: string;

  // Used as an id field;
  readonly name: string;

  // Websocket Connection url
  readonly url: string;

  // Driver type, like aws.
  readonly driver: string;

  static isComplete(obj: any): obj is DiagramSettings {
    return (
      obj.title !== undefined && obj.name !== undefined &&
      obj.url !== undefined && obj.driver !== undefined
    );
  }

  constructor({title, name, url, driver}) {
    this.title = title;
    this.name = name;
    this.url = url;
    this.driver = driver;
  }
}


class GrapherStorage {
  private readonly prefix: string;
  private readonly storage: Storage;

  constructor() {
    this.storage = window[STORAGE_TYPE];
    this.prefix = PREFIX;
  }

  public getDiagrams(): Array<DiagramSettings> {
    const result = [];
    try {
      const items = JSON.parse(this.storage.getItem(this.formatKey(DIAGRAMS_KEY)));
      for (const item of items) {
        if (DiagramSettings.isComplete(item)) {
          result.push(new DiagramSettings(item));
        }
      }
      return result;
    } catch (e) {
      return result;
    }
  }

  private set(key: string, value: any): boolean {
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

  private formatKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}


@Injectable({
  providedIn: 'root'
})
export class GrapherSettingsService {

  private storage: GrapherStorage;

  private currentDiagram = new Subject<DiagramSettings>();
  diagramChanged$ = this.currentDiagram.asObservable();

  constructor() {
    this.storage = new GrapherStorage();
  }

  public changeCurrentDiagram(diagramId: string) {
    this.currentDiagram.next(this.diagrams[diagramId]);
  }

  public get diagrams(): Array<DiagramSettings> {
    return this.storage.getDiagrams();
  }
}
