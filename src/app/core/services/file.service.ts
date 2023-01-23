import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConstantDef } from '../constant-def';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = environment.apiUrl + ConstantDef.FILE_PREFIX;

  private listFileUrl = this.baseUrl + '/list-file/';
  private uploadFileUrl = this.baseUrl + '/upload-file/';
  private downloadFileUrl = this.baseUrl + '/download-file/';
  private signDownloadFileUrl = this.baseUrl + '/sign-download-file/';
  private deleteFileUrl = this.baseUrl + '/delete-file/';
  private deleteAllFileUrl = this.baseUrl + '/delete-all-file/';

  constructor(
    private http: HttpClient
  ) { }

  getListFile(pageSize: any, page: any) {
    const params = new HttpParams()
      .set('page_size', pageSize)
      .set('page', page);
    return this.http.get(this.listFileUrl, { params });
  }

  uploadFile(formData: any) {
    return this.http.post(this.uploadFileUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  downloadFile(ciphertext: string, nonce: string, tag: string) {
    const url = new URL(this.downloadFileUrl);
    url.searchParams.append('ciphertext', ciphertext);
    url.searchParams.append('nonce', nonce);
    url.searchParams.append('tag', tag);
    window.location.assign(url);
  }

  signDownloadFile(id: any) {
    return this.http.get(this.signDownloadFileUrl + id + '/');
  }

  deleteFile(id: any) {
    return this.http.delete(this.deleteFileUrl + id + '/');
  }

  deleteAllFile() {
    return this.http.delete(this.deleteAllFileUrl);
  }
}
