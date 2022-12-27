import { AfterViewInit, Component } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    private fileService: FileService
  ) { }

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      const pageSizeParam = params.page_size;
      const pageIndexParam = params.page_index;
      if (this.isNormalInteger(pageSizeParam) && this.isNormalInteger(pageIndexParam)) {
        this.pageSize = Number(pageSizeParam);
        this.pageIndex = Number(pageIndexParam);
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
}
