import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { FileSizePipe } from '../core/pipe/file-size.pipe';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@NgModule({
  declarations: [
    HomeComponent,
    FileSizePipe,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatPaginatorModule,
    MatTableModule,
    MatProgressBarModule,
  ]
})
export class HomeModule { }
