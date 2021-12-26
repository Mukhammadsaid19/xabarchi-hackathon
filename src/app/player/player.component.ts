import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FeedService } from '../feed/feed.service';
import { TtsService } from '../feed/tts.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements AfterViewInit {
  @Output() notifyFeed: EventEmitter<any> = new EventEmitter();

  globalQueue = [];

  @ViewChild('audio1') audio1: ElementRef;
  @ViewChild('audio2') audio2: ElementRef;

  constructor(private ttsService: TtsService) {}

  ngAfterViewInit(): void {
    this.ttsService.tokenized$.subscribe((sentences) => {
      if (sentences.length !== 0) {
        // Bad technique
        sentences.push('sentinel');
        this.globalQueue = sentences;
        this.audioPlay();
      }
    });

    this.ttsService.isPlaying$.subscribe((value) => {
      if (value === 'RESUME') {
        this.audioResume();
        // console.log('PLAYING: ', value);
      } else if (value === 'PAUSE') {
        this.audioStop();
        // console.log('PLAYING: ', value);
      } else {
        console.log('INIT');
      }
    });
  }

  audioPlay() {
    this.audio1.nativeElement.src = this.getAudioUrl(this.globalQueue.shift());
    this.audio1.nativeElement.load();
    this.audio1.nativeElement.play();

    this.audio2.nativeElement.src = this.getAudioUrl(this.globalQueue.shift());
    this.audio2.nativeElement.load();
  }

  audioEnded(num: number) {
    if (this.globalQueue.length !== 0) {
      let currentAudioToPlay = num === 1 ? this.audio2 : this.audio1;
      currentAudioToPlay.nativeElement.play();
      this.loadNext(num);
    } else {
      if (
        !this.isAudioPlaying(this.audio1) &&
        !this.isAudioPlaying(this.audio2)
      ) {
        this.notifyFeed.emit('Ended');
      }
    }
  }

  audioResume() {
    console.log('Resume');
    if (!this.isAudioPlaying(this.audio1)) {
      this.audio1.nativeElement.play();
    } else {
      this.audio2.nativeElement.play();
    }
  }

  audioStop() {
    console.log('Stop');
    if (this.isAudioPlaying(this.audio1)) {
      this.audio1.nativeElement.pause();
    } else {
      this.audio2.nativeElement.pause();
    }
  }

  isAudioPlaying(audio) {
    return (
      audio.nativeElement.currentTime > 0 &&
      !audio.nativeElement.paused &&
      !audio.nativeElement.ended
    );
  }

  loadNext(num: number) {
    let currentAudio = num === 1 ? this.audio1 : this.audio2;
    currentAudio.nativeElement.src = this.getAudioUrl(this.globalQueue.shift());

    currentAudio.nativeElement.load();
  }

  getAudioUrl(sentence: string) {
    return `https://internal.nutq.uz/api/v1/cabinet/synthesize/?t=${sentence}`;
  }
}
