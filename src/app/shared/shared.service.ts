import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifyDialogComponent } from './notify-dialog/notify-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private dialog: MatDialog,
  ) { }

  openNotifyDialog(title: string, content: string) {
    return this.dialog.open(NotifyDialogComponent, {
      width: '490px',
      disableClose: true,
      autoFocus: false,
      data: { title, content },
    });
  }
}
