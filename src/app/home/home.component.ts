import { HttpEventType } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { FileService } from '../core/services/file.service';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  length = 0;
  pageSize = 100;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];

  listData = [];
  selection: any[] = [];
  displayedColumns: string[] = ['select', 'file_name', 'created', 'file_size'];

  isUploading = false
  uploadProgress = 0;

  maxHeightTableContainer = 0;

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    private fileService: FileService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngAfterViewInit(): void {
    this.titleService.setTitle('File Management');
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
    setTimeout(() => {
      this.getMaxHeightTableContainer();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    setTimeout(() => {
      this.getMaxHeightTableContainer();
    });
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
          this.selection = [];
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

  toggleAllRows() {
    if (this.selection.length > 0 && this.selection.length === this.listData.length) {
      this.selection = [];
    } else {
      this.selection = [];
      this.listData.forEach((ele: any) => {
        this.selection.push(ele.id);
      });
    }
  }

  toggleSelectElement(id: string) {
    const index = this.selection.indexOf(id);
    if (index > -1) {
      this.selection.splice(index, 1);
    } else {
      this.selection.push(id);
    }
  }

  isRowSelected(id: string) {
    return this.selection.includes(id);
  }

  download() {
    this.fileService.signDownloadFile(this.selection)
      .subscribe({
        next: (response: any) => {
          this.fileService.downloadFile(response.ciphertext, response.nonce, response.tag);
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

  deleteFile() {
    this.fileService.deleteFile(this.selection).subscribe({
      next: (response: any) => {
        this.requestSearch(this.pageSize, this.pageIndex, true);
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

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(i.toString(), files[i]);
    }

    this.isUploading = true;
    const upload$ = this.fileService.uploadFile(formData).pipe(
      finalize(() => {
        event.target.value = null;
        this.uploadProgress = 0;
        this.isUploading = false;
        this.requestSearch(this.pageSize, this.pageIndex, true);
        this.sharedService.openNotifyDialog('Notify', 'Upload file successfully');
      })
    );

    upload$.subscribe((event: any) => {
      if (event.type == HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round(100 * (event.loaded / event.total));
      }
    })
  }

  getMaxHeightTableContainer() {
    const windowHeight = window.innerHeight;
    const toolbarEle = document.getElementById('toolbar');
    const toolbarHeight = toolbarEle ? toolbarEle.offsetHeight : 0;
    const actionBarEle = document.getElementById('action-bar');
    const actionBarHeight = actionBarEle ? actionBarEle.offsetHeight : 0;
    const matPaginatorEle = document.getElementById('mat-paginator');
    const matPaginatorHeight = matPaginatorEle ? matPaginatorEle.offsetHeight : 0;
    const paddingAndMargin = 30;
    this.maxHeightTableContainer = windowHeight - toolbarHeight - actionBarHeight - matPaginatorHeight - paddingAndMargin;
    this.cdr.detectChanges();
  }

  isHidePageSize() {
    return window.innerWidth < 768;
  }
}
