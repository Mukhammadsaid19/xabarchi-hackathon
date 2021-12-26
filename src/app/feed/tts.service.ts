import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Tokenizer from 'sentence-tokenizer';

@Injectable({
  providedIn: 'root',
})
export class TtsService {
  tokenizer: Tokenizer;
  tokenized$: BehaviorSubject<string[]>;
  isPlaying$: BehaviorSubject<'RESUME' | 'PAUSE' | 'INIT'>;

  constructor(private http: HttpClient) {
    this.tokenizer = new Tokenizer('Chuck');
    this.tokenized$ = new BehaviorSubject([]);
    this.isPlaying$ = new BehaviorSubject('INIT');
  }

  public tokenize(text: string) {
    this.tokenizer.setEntry(text);
    this.tokenized$.next(this.tokenizer.getSentences());
    // this.isPlaying$.next(true);
  }

  public sendText(text: string) {
    this.tokenize(text);
  }

  // public pause() {
  //   this.isPlaying$.next(false);
  // }
}
