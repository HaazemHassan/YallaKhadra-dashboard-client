import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResult } from '../../../shared/models/paginated-result.model';
import { Product } from '../models/product.model';
import { AddProductRequest } from '../models/add-product-request.model';
import { GetProductsRequest } from '../models/get-products-request.model';
import { ProductApiResponse } from '../models/product-api-response.model';
import { UpdateProductRequest } from '../models/update-product-request.model';

interface ProductCategoryApiDto {
  id: number;
  name: string;
}

interface ProductListItemApiDto {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  category: ProductCategoryApiDto | null;
  mainImageUrl: string | null;
}

interface ProductImageApiDto {
  id: number;
  url: string;
  isMain: boolean;
}

interface ProductDetailsApiDto {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  category: ProductCategoryApiDto | null;
  images: ProductImageApiDto[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = `${environment.apiBaseUrl}/api/Product`;

  getProducts(request: GetProductsRequest): Observable<PaginatedResult<Product>> {
    let params = new HttpParams()
      .set('pageNumber', request.pageNumber.toString())
      .set('pageSize', request.pageSize.toString());

    if (request.searchTerm && request.searchTerm.trim()) {
      params = params.set('searchTerm', request.searchTerm.trim());
    }

    if (request.categoryId !== undefined && request.categoryId !== null) {
      params = params.set('categoryId', request.categoryId.toString());
    }

    return this.http.get<PaginatedResult<ProductListItemApiDto>>(this.productsUrl, { params }).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.messages?.[0] ?? 'Failed to load products from API.');
        }

        return {
          ...response,
          data: (response.data ?? []).map((product) => this.mapListProduct(product))
        };
      })
    );
  }

  getProductById(productId: number): Observable<Product> {
    return this.http.get<ProductApiResponse<ProductDetailsApiDto>>(`${this.productsUrl}/id/${productId}`).pipe(
      map((response) => {
        if (!response.succeeded || !response.data) {
          throw new Error(this.resolveApiError(response, 'Failed to load product details.'));
        }

        return this.mapDetailsProduct(response.data);
      })
    );
  }

  addProduct(request: AddProductRequest): Observable<ProductApiResponse<Product>> {
    const formData = this.buildProductFormData(request);

    return this.http.post<ProductApiResponse<ProductDetailsApiDto>>(`${this.productsUrl}/add`, formData).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(this.resolveApiError(response, 'Failed to add product.'));
        }

        return {
          ...response,
          data: response.data ? this.mapDetailsProduct(response.data) : null
        };
      })
    );
  }

  updateProduct(productId: number, request: UpdateProductRequest): Observable<ProductApiResponse<Product>> {
    const formData = this.buildProductFormData(request);

    return this.http.patch<ProductApiResponse<ProductDetailsApiDto>>(`${this.productsUrl}/${productId}`, formData).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(this.resolveApiError(response, 'Failed to update product.'));
        }

        return {
          ...response,
          data: response.data ? this.mapDetailsProduct(response.data) : null
        };
      })
    );
  }

  deleteProduct(productId: number): Observable<ProductApiResponse<null>> {
    return this.http.delete<ProductApiResponse<null>>(`${this.productsUrl}/delete/${productId}`).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(this.resolveApiError(response, 'Failed to delete product.'));
        }

        return response;
      })
    );
  }

  private mapListProduct(product: ProductListItemApiDto): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      pointsCost: product.pointsCost,
      stock: product.stock,
      category: product.category?.name ?? 'Uncategorized',
      categoryId: product.category?.id,
      images: product.mainImageUrl ? [product.mainImageUrl] : []
    };
  }

  private mapDetailsProduct(product: ProductDetailsApiDto): Product {
    const images = [...product.images]
      .sort((leftImage, rightImage) => Number(rightImage.isMain) - Number(leftImage.isMain))
      .map((image) => image.url);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      pointsCost: product.pointsCost,
      stock: product.stock,
      category: product.category?.name ?? 'Uncategorized',
      categoryId: product.category?.id,
      images
    };
  }

  private buildProductFormData(request: AddProductRequest | UpdateProductRequest): FormData {
    const formData = new FormData();
    formData.append('Name', request.name);
    formData.append('Description', request.description);
    formData.append('PointsCost', request.pointsCost.toString());
    formData.append('Stock', request.stock.toString());
    formData.append('CategoryId', request.categoryId.toString());

    request.images?.forEach((image) => {
      formData.append('Images', image, image.name);
    });

    return formData;
  }

  private resolveApiError(response: ProductApiResponse<unknown>, fallbackMessage: string): string {
    if (response.errors && response.errors.length > 0) {
      return response.errors[0];
    }

    if (response.message && response.message.trim()) {
      return response.message;
    }

    return fallbackMessage;
  }
}
