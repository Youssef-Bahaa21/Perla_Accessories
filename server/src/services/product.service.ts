import { pool as db } from '../config/db';

export interface CreateProductDTO {
    name: string;
    description?: string;
    price: number;
    stock: number;
    category_id: number;
    is_new?: number;
    is_best_seller?: number;
    is_featured?: number;
}

export interface UpdateProductDTO {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category_id?: number;
    is_new?: number;
    is_best_seller?: number;
    is_featured?: number;
}

export interface ProductImage {
    id: number;
    product_id: number;
    image: string;
    public_id?: string; // Added for Cloudinary public_id
}

export interface CloudinaryImageData {
    public_id: string;
    secure_url: string;
}

export interface ProductWithImages {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: number;
    is_new: number;
    is_best_seller: number;
    is_featured: number;
    created_at: string;
    images: { id: number; product_id: number; image: string }[];
}

export interface PagedProducts {
    data: ProductWithImages[];
    page: number;
    limit: number;
    total: number;
}

export class ProductService {
    // Find products with pagination
    async findPage(page: number, limit: number) {
        const offset = (page - 1) * limit;

        // Get total count
        const [countResult]: any = await db.query(
            'SELECT COUNT(*) as total FROM product'
        );
        const total = countResult[0].total;

        // 1. Get products
        const [products]: any = await db.query(
            `SELECT * FROM product ORDER BY id DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        if (products.length === 0) {
            return {
                data: [],
                page,
                limit,
                total
            };
        }

        // 2. Get product IDs
        const productIds = products.map((p: any) => p.id);

        // 3. Get images for these products
        const [images]: any = await db.query(
            `SELECT * FROM product_images WHERE product_id IN (?)`,
            [productIds]
        );

        // 4. Group images by product_id
        const imagesMap: Record<number, ProductImage[]> = {};
        for (const img of images) {
            if (!imagesMap[img.product_id]) {
                imagesMap[img.product_id] = [];
            }
            imagesMap[img.product_id].push(img);
        }

        // 5. Add images to products
        const result = products.map((p: any) => ({
            ...p,
            images: imagesMap[p.id] || []
        }));

        return {
            data: result,
            page,
            limit,
            total
        };
    }

    // Find a product by ID
    async findById(id: number) {
        // 1. Get product
        const [products]: any = await db.query(
            `SELECT * FROM product WHERE id = ?`,
            [id]
        );

        if (products.length === 0) return null;

        const product = products[0];

        // 2. Get images for this product
        const [images]: any = await db.query(
            `SELECT * FROM product_images WHERE product_id = ?`,
            [id]
        );

        return {
            ...product,
            images: images || []
        };
    }

    // Create a new product
    async create(dto: CreateProductDTO) {
        const [result]: any = await db.query(
            `INSERT INTO product 
            (name, description, price, stock, category_id, is_new, is_best_seller, is_featured) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dto.name,
                dto.description || '',
                dto.price,
                dto.stock,
                dto.category_id,
                dto.is_new || 0,
                dto.is_best_seller || 0,
                dto.is_featured || 0
            ]
        );

        return {
            id: result.insertId,
            ...dto
        };
    }

    // Update a product
    async update(id: number, dto: UpdateProductDTO) {
        // Build the SET clause and values array
        const sets: string[] = [];
        const values: any[] = [];

        if (dto.name !== undefined) {
            sets.push('name = ?');
            values.push(dto.name);
        }

        if (dto.description !== undefined) {
            sets.push('description = ?');
            values.push(dto.description);
        }

        if (dto.price !== undefined) {
            sets.push('price = ?');
            values.push(dto.price);
        }

        if (dto.stock !== undefined) {
            sets.push('stock = ?');
            values.push(dto.stock);
        }

        if (dto.category_id !== undefined) {
            sets.push('category_id = ?');
            values.push(dto.category_id);
        }

        if (dto.is_new !== undefined) {
            sets.push('is_new = ?');
            values.push(dto.is_new);
        }

        if (dto.is_best_seller !== undefined) {
            sets.push('is_best_seller = ?');
            values.push(dto.is_best_seller);
        }

        if (dto.is_featured !== undefined) {
            sets.push('is_featured = ?');
            values.push(dto.is_featured);
        }

        if (!sets.length) return false;

        // Add ID to values for WHERE clause
        values.push(id);

        const [result]: any = await db.query(
            `UPDATE product SET ${sets.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Delete a product
    async delete(id: number) {
        const [result]: any = await db.query(
            'DELETE FROM product WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }

    // Get product images
    async getProductImages(productId: number): Promise<ProductImage[]> {
        const [rows]: any = await db.query(
            'SELECT * FROM product_images WHERE product_id = ?',
            [productId]
        );

        return rows;
    }

    // Get a specific product image by ID
    async getProductImageById(imageId: number): Promise<ProductImage | null> {
        const [rows]: any = await db.query(
            'SELECT * FROM product_images WHERE id = ?',
            [imageId]
        );

        return rows.length ? rows[0] : null;
    }

    // Delete a product image
    async deleteProductImage(productId: number, imageId: number) {
        const [result]: any = await db.query(
            'DELETE FROM product_images WHERE product_id = ? AND id = ?',
            [productId, imageId]
        );

        return result.affectedRows > 0;
    }

    // Upload Cloudinary images for a product
    async uploadCloudinaryImages(productId: number, images: CloudinaryImageData[]) {
        // Insert image records
        const values = images.map(img => [
            productId,
            img.secure_url,
            img.public_id
        ]);

        if (!values.length) return { success: false, images: [] };

        const [result]: any = await db.query(
            'INSERT INTO product_images (product_id, image, public_id) VALUES ?',
            [values]
        );

        // Get the inserted image records
        const insertId = result.insertId;
        const count = result.affectedRows;

        if (count === 0) return { success: false, images: [] };

        const insertedImageIds = Array.from({ length: count }, (_, i) => insertId + i);

        const [rows]: any = await db.query(
            'SELECT * FROM product_images WHERE id IN (?)',
            [insertedImageIds]
        );

        return {
            success: true,
            images: rows
        };
    }
}
