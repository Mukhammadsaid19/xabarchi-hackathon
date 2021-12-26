import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { parseString } from 'xml2js';
import { IRssItem, NewsRss } from './types/INews';
import { RSS } from './types/IOptions';

interface IRSSDescription {
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  streamRss$: BehaviorSubject<IRssItem[]>;
  tempArray: IRssItem[];
  rssUrls = {
    DARYO: 'https://daryo.uz/uz/feed/',
    KUN: 'https://kun.uz/uz/news/rss',
    GAZETA: 'https://www.gazeta.uz/uz/rss/',
  };
  isLoaded$: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
    this.streamRss$ = new BehaviorSubject([]);
    this.isLoaded$ = new BehaviorSubject(false);
  }

  getRssByOptions(rssOptions: RSS[]) {
    for (let i = 0; i < rssOptions.length; i++) {
      let end = i === rssOptions.length - 1;
      this.getRss(this.rssUrls[rssOptions[i]], end);
    }
  }

  getRssText(url: string, source: string) {
    return this.http
      .post<IRSSDescription>('http://127.0.0.1:8000/parse', {
        source,
        url,
      })
      .toPromise();
  }

  getRss(rssUrl, end: boolean) {
    const requestOptions: Object = {
      observe: 'body',
      responseType: 'text',
    };
    this.http.get<any>(rssUrl, requestOptions).subscribe((data) => {
      parseString(data, (err, result: NewsRss) => {
        let items = result?.rss.channel[0].item;
        items.map((x) => (x.source = result?.rss.channel[0].title[0]));

        this.streamRss$.next(
          [...this.streamRss$.getValue(), ...items].sort((a, b) => {
            return (
              new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
            );
          })
        );
        if (end) {
          this.isLoaded$.next(end);
        }
      });
    });
  }
}
