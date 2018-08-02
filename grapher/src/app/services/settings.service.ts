import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


const STORAGE_TYPE = 'localStorage';
const PREFIX = 'grapher';
const DIAGRAMS_KEY = 'diagrams';


export class DiagramSettings {
  // Title will be displayed in a toolbar.
  title: string;

  // Used as an id field;
  name: string;

  static isComplete(obj: any): obj is DiagramSettings {
    return obj.title !== undefined && obj.name !== undefined;
  }

  constructor(data: Object) {
    this.title = data['title'];
    this.name = data['name'];
  }
}


class GrapherStorage {
  private storage: Storage;
  private prefix: string;

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
