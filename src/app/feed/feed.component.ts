import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeedService } from './feed.service';
import { TtsService } from './tts.service';
import { IRssItem, NewsRss } from './types/INews';
import { RSS } from './types/IOptions';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {
  rssItems: IRssItem[];
  rssItemsSubscription: Subscription;
  isPlaying: any;

  toggleImageUrl = "url('assets/img/play.svg') no-repeat center";

  currentArticle: number;

  websites: RSS[];

  selectedWebsites: RSS[];

  sliderValue = 50;

  constructor(public feedService: FeedService, private ttsService: TtsService) {
    this.websites = ['DARYO', 'GAZETA', 'KUN'];
  }

  loadData(event) {
    //event.first = First row offset
    //event.rows = Number of rows per page
  }

  ngOnInit(): void {
    this.rssItemsSubscription = this.feedService.streamRss$.subscribe(
      (data) => {
        if (data) {
          this.rssItems = data;
          let text = this.rssItems[this.currentArticle].title[0];
          this.ttsService.sendText(text);
          this.ttsService.isPlaying$.next('RESUME');
          this.toggleImageUrl = "url('assets/img/pause.svg') no-repeat center";
        }
      }
    );

    this.ttsService.isPlaying$.subscribe((val) => (this.isPlaying = val));

    this.currentArticle = 0;
  }

  ngOnDestroy(): void {
    this.rssItemsSubscription.unsubscribe();
  }

  getRss() {
    this.feedService.getRssByOptions(this.selectedWebsites);

    // this.changeArticle();
  }

  changeArticle() {
    let text = this.rssItems[this.currentArticle].title[0];
    this.ttsService.sendText(text);
  }

  toggle() {
    if (this.isPlaying === 'RESUME' || this.isPlaying === 'INIT') {
      this.ttsService.isPlaying$.next('PAUSE');
      this.toggleImageUrl = "url('assets/img/play.svg') no-repeat center";
    } else if (this.isPlaying === 'PAUSE') {
      this.ttsService.isPlaying$.next('RESUME');
      this.toggleImageUrl = "url('assets/img/pause.svg') no-repeat center";
    } else {
      console.log('FIRST TIME');
    }
  }

  prev() {
    if (this.currentArticle > 0) {
      --this.currentArticle;
      this.changeArticle();
    }
  }

  next() {
    ++this.currentArticle;
    this.changeArticle();
  }

  nextArticle($event) {
    ++this.currentArticle;
    this.changeArticle();
  }
}
