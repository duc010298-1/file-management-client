import { Component } from '@angular/core';
import { FileService } from '../core/services/file.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(
    private fileService: FileService
  ) {}
}
