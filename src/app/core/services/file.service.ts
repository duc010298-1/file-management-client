import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantDef } from '../constant-def';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = ConstantDef.API_URL + ConstantDef.FILE_PREFIX;

  private listFileUrl = this.baseUrl + '/list-file/';
  private uploadFileUrl = this.baseUrl + '/upload-file/';
  private downloadFileUrl = this.baseUrl + '/download-file/';
  private deleteFileUrl = this.baseUrl + '/delete-file/';

  constructor(
    private http: HttpClient
  ) { }

  getListFile(pageSize: any, page: any) {
    const params = new HttpParams()
      .set('page_size', pageSize)
      .set('page', page);
    return this.http.get(this.listFileUrl, { params });
  }

  downloadFile(id: any) {
    return this.http.get(this.downloadFileUrl + id, { responseType: 'blob', observe: 'response' });
  }
}
