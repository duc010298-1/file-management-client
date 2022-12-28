import { HttpEventType } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
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
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];

  listData = [];
  displayedColumns: string[] = ['index', 'file_name', 'file_size', 'created', 'tool'];

  isUploading = false
  uploadProgress = 0;

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

  downloadFile(id: any) {
    this.fileService.signDownloadFile(id)
      .subscribe({
        next: (response: any) => {
          this.fileService.downloadFile(response.ciphertext, response.nonce, response.tag)
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

  deleteFile(id: any) {
    this.fileService.deleteFile(id).subscribe({
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

  deleteAll() {
    this.fileService.deleteAllFile().subscribe({
      next: (response: any) => {
        this.requestSearch(this.pageSize, this.pageIndex, true);
        this.sharedService.openNotifyDialog('Notify', 'Deleted all files');
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
}
