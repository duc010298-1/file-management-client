import { HttpHeaders } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../core/services/file.service';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  length = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];

  listData = [];
  displayedColumns: string[] = ['index', 'file_name', 'file_size', 'created', 'tool'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    private fileService: FileService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      const pageSizeParam = params.page_size;
      const pageIndexParam = params.page_index;
      if (this.isNormalInteger(pageSizeParam) && this.isNormalInteger(pageIndexParam)) {
        this.pageSize = Number(pageSizeParam);
        this.pageIndex = Number(pageIndexParam);
        this.cdr.detectChanges();
      }
      if (pageSizeParam !== undefined && pageIndexParam !== undefined) {
        this.requestSearch(this.pageSize, this.pageIndex, true);
      } else {
        this.requestSearch(this.pageSize, this.pageIndex);
      }
    }).unsubscribe();
  }

  isNormalInteger(str: string) {
    const n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
  }

  onPageEvent(event: any) {
    this.requestSearch(event.pageSize, event.pageIndex, true);
  }

  requestSearch(pageSize: number, pageIndex: number, isPageEvent?: boolean) {
    this.fileService.getListFile(pageSize, pageIndex + 1)
      .subscribe({
        next: (data: any) => {
          this.length = data.count;
          this.pageSize = data.page_size;
          this.pageIndex = data.page_number - 1;
          this.listData = [];
          if (this.length === 0) {
            return;
          }
          this.listData = data.results;
          this.updateParam(isPageEvent);
        },
        error: (error: any) => {
          const detail = error.error[Object.keys(error.error)[0]][0] || error.statusText || error.status;
          switch (detail) {
            default:
              console.error(detail);
              this.sharedService.openNotifyDialog('Error', 'Failed to load data, please reload the page');
          }
        }
      });
  }

  updateParam(isPageEvent?: boolean) {
    const queryParams: any = {};

    if (isPageEvent !== undefined && isPageEvent) {
      queryParams.page_size = this.pageSize;
      queryParams.page_index = this.pageIndex;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  async download(id: any) {
    this.fileService.downloadFile(id)
      .subscribe({
        next: (response: any) => {
          const url = window.URL.createObjectURL(response.body);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = this.getFilenameFromHeaders(response.headers) || 'file';
          anchor.click();
          URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          const detail = error.error[Object.keys(error.error)[0]][0] || error.statusText || error.status;
          switch (detail) {
            default:
              console.error(detail);
              this.sharedService.openNotifyDialog('Error', 'Failed to load data, please reload the page');
          }
        }
      });
  }

  private getFilenameFromHeaders(headers: HttpHeaders) {
    // The content-disposition header should include a suggested filename for the file
    const contentDisposition = headers.get('Content-Disposition');
    if (!contentDisposition) {
      return null;
    }

    const leadIn = 'filename=';
    const start = contentDisposition.search(leadIn);
    if (start < 0) {
      return null;
    }

    // Get the 'value' after the filename= part (which may be enclosed in quotes)
    const value = contentDisposition.substring(start + leadIn.length).trim();
    if (value.length === 0) {
      return null;
    }

    // If it's not quoted, we can return the whole thing
    const firstCharacter = value[0];
    if (firstCharacter !== '\"' && firstCharacter !== '\'') {
      return value;
    }

    // If it's quoted, it must have a matching end-quote
    if (value.length < 2) {
      return null;
    }

    // The end-quote must match the opening quote
    const lastCharacter = value[value.length - 1];
    if (lastCharacter !== firstCharacter) {
      return null;
    }

    // Return the content of the quotes
    return value.substring(1, value.length - 1);
  }
}
