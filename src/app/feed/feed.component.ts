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
    this.selectedWebsites = [];

    this.getRss();
  }

  loadData(event) {
    //event.first = First row offset
    //event.rows = Number of rows per page
  }

  ngOnInit(): void {
    this.rssItemsSubscription = this.feedService.streamRss$.subscribe(
      async (data) => {
        if (data) {
          this.rssItems = data;
          let title = this.rssItems[this.currentArticle].title[0];
          title += this.rssItems[this.currentArticle].description;

          // let moreText = await this.feedService.getRssText(
          //   this.rssItems[this.currentArticle].link[0],
          //   this.parseSource(this.rssItems[this.currentArticle].source)
          // );

          // if (moreText.description !== 'hehe') {
          //   this.rssItems[this.currentArticle].description = [
          //     moreText.description,
          //   ];
          //   title += moreText;
          // }

          this.ttsService.sendText(title);
          this.ttsService.isPlaying$.next('RESUME');
          this.toggleImageUrl = "url('assets/img/pause.svg') no-repeat center";
        }
      }
    );

    this.ttsService.isPlaying$.subscribe((val) => (this.isPlaying = val));

    this.currentArticle = 0;
  }

  parseSource(source): string {
    switch (source) {
      case 'Daryo':
        return 'daryo';
      case 'Газета.uz':
        return 'gazeta';
      case 'Kun.uz':
        return 'kun';
    }
    return 'daryo';
  }

  ngOnDestroy(): void {
    this.rssItemsSubscription.unsubscribe();
  }

  getRss() {
    this.feedService.getRssByOptions(this.selectedWebsites);

    // this.changeArticle();
  }

  changeArticle() {
    let title = this.rssItems[this.currentArticle].title[0];
    title += this.rssItems[this.currentArticle].description;
    this.ttsService.sendText(title);
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
