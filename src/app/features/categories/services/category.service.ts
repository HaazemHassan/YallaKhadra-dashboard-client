import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResult } from '../../../shared/models/paginated-result.model';
import { AddCategoryRequest } from '../models/add-category-request.model';
import { CategoryApiResponse } from '../models/category-api-response.model';
import { Category } from '../models/category.model';
import { GetCategoriesRequest } from '../models/get-categories-request.model';
import { UpdateCategoryRequest } from '../models/update-category-request.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly categoryUrl = `${environment.apiBaseUrl}/api/category`;

  getCategories(request: GetCategoriesRequest): Observable<PaginatedResult<Category>> {
    let params = new HttpParams();

    if (request.searchTerm && request.searchTerm.trim()) {
      params = params.set('searchTerm', request.searchTerm.trim());
    }

    if (request.pageNumber !== undefined && request.pageNumber !== null) {
      params = params.set('pageNumber', request.pageNumber.toString());
    }

    if (request.pageSize !== undefined && request.pageSize !== null) {
      params = params.set('pageSize', request.pageSize.toString());
    }

    return this.http.get<PaginatedResult<Category>>(this.categoryUrl, { params }).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.messages?.[0] ?? 'Failed to load categories from API.');
        }

        return {
          ...response,
          data: response.data ?? []
        };
      })
    );
  }

  addCategory(request: AddCategoryRequest): Observable<CategoryApiResponse<Category>> {
    return this.http.post<CategoryApiResponse<Category>>(this.categoryUrl, request).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to add category.');
        }

        return response;
      })
    );
  }

  updateCategory(categoryId: number, request: UpdateCategoryRequest): Observable<CategoryApiResponse<Category>> {
    return this.http.patch<CategoryApiResponse<Category>>(`${this.categoryUrl}/${categoryId}`, request).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to update category.');
        }

        return response;
      })
    );
  }

  deleteCategory(categoryId: number): Observable<CategoryApiResponse<null>> {
    return this.http.delete<CategoryApiResponse<null>>(`${this.categoryUrl}/${categoryId}`).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message ?? response.errors?.[0] ?? 'Failed to delete category.');
        }

        return response;
      })
    );
  }
}
