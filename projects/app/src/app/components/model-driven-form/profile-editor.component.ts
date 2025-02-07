import { Store } from '@actionstack/angular';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { deepClone, selectFormState } from 'nygma-forms';
import { Observable, firstValueFrom, fromEvent, merge, shareReplay } from 'rxjs';
import { occurence } from '../../animations/animations';
import { initialModelPage } from '../../models/profile';
import { selectSlice, updateProperty } from '../../reducers';

@Component({
    selector: 'standard-profile-editor',
    templateUrl: './profile-editor.component.html',
    styleUrls: ['./profile-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [occurence],
    standalone: false
})
export class StandardProfileEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('modelForm') form: NgForm | null = null;

  @Input() caption = '';
  @Output() messenger = new EventEmitter<boolean>();

  profile$!: Observable<any>;
  slice = "main.model";
  formCast = "main.model.form";
  model = initialModelPage.form;

  a: any; b: any;

  _collapsed = true;
  @HostBinding('class.collapsed') set collapsed(value: boolean) {
    this._collapsed = value;
    this.store.dispatch(updateProperty({value: value, path: this.slice, property: 'collapsed'}));
  }

  get collapsed() {
    return this._collapsed;
  }

  constructor(private store: Store, private elementRef: ElementRef) {
  }

  async ngAfterViewInit() {

    const state = await firstValueFrom(this.store.select(selectFormState(this.formCast, true)));

    this.model = state ? deepClone(state) : initialModelPage.form;
    this.collapsed = true;

    this.profile$ = this.store.select(selectSlice(this.slice)).pipe(shareReplay());

    const scrollable = this.elementRef.nativeElement.querySelector('.scrollable');
    this.b = merge(fromEvent(window, 'resize'), fromEvent(scrollable, 'scroll')).subscribe((e: any) => {
      scrollable.style.height = window.innerHeight - scrollable.offsetTop - 60 + 'px';
    });

    window.dispatchEvent(new Event('resize'));
  }

  addAlias() {
    this.model.aliases.push('');
  }

  trackById(index: number, obj: string): any {
    return index;
  }

  onSubmit() {
    if(this.form?.valid) {
      alert("Form submitted successfully");
    }
  }

  ngOnDestroy() {
    this.b.unsubscribe();
  }
}
