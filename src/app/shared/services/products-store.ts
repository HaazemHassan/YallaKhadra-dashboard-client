import { Injectable, signal } from '@angular/core';
import { Product } from '../../features/products/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsStore {
  private readonly productsState = signal<Product[]>([]);

  readonly products = this.productsState.asReadonly();

  setProducts(products: Product[]): void {
    this.productsState.set(products);
  }

  addProduct(product: Product): void {
    this.productsState.update((existingProducts) => [product, ...existingProducts]);
  }

  updateProduct(updatedProduct: Product): void {
    this.productsState.update((existingProducts) =>
      existingProducts.map((product) =>
        product.id === updatedProduct.id
          ? updatedProduct
          : product
      )
    );
  }

  removeProduct(productId: number): void {
    this.productsState.update((existingProducts) =>
      existingProducts.filter((product) => product.id !== productId)
    );
  }

  clear(): void {
    this.productsState.set([]);
  }
}
