import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotifyDialogComponent } from './notify-dialog/notify-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    NotifyDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ]
})
export class SharedModule { }
