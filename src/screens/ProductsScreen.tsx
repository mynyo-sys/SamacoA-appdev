import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { productsApi, type Product } from '../app/api/brewery';
import { addToCart, getCartItemCount } from '../utils/cartStorage';
import type { RootState } from '../app/reducers';
import { ROUTES, type MainStackParamList } from '../types';

const { width } = Dimensions.get('window');

type ProductsScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Products'>;

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const filterProducts = React.useCallback(() => {
    let filtered = Array.isArray(products) ? [...products] : [];

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  useEffect(() => {
    loadProducts();
    loadCartCount();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const loadCartCount = async () => {
    const count = await getCartItemCount();
    setCartItemCount(count);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsApi.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      console.error('[PRODUCTS] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'Please login to add items to cart',
        position: 'top',
        visibilityTime: 3000,
      });
      navigation.navigate('Auth' as any, { screen: 'Login' });
      return;
    }

    try {
      setAddingToCart(true);

      await addToCart(selectedProduct, 1);
      
      // Update cart count
      const newCount = await getCartItemCount();
      setCartItemCount(newCount);

      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${selectedProduct.name} added to your cart`,
        position: 'top',
        visibilityTime: 2000,
      });

      setModalVisible(false);
      setSelectedProduct(null);
      
      // Don't auto-navigate - let user continue shopping
      
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Add to Cart Failed',
        text2: err.message || 'Could not add item to cart',
        position: 'top',
        visibilityTime: 3000,
      });
      console.error('[PRODUCTS] Add to cart error:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleViewCart = () => {
    if (cartItemCount === 0) {
      Toast.show({
        type: 'info',
        text1: 'Cart is Empty',
        text2: 'Add some products to your cart first',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }
    navigation.navigate(ROUTES.CART as any);
  };

  const categories = ['All', 'Local Craft Beers', 'Imported Beers', 'Filipino Lagers', 'Seasonal Specials', 'Non-Alcoholic'];

  const renderEmptyList = React.useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>😢</Text>
        <Text style={styles.emptyText}>No products found</Text>
        <Text style={styles.emptySubtext}>Try adjusting your search</Text>
      </View>
    ),
    []
  );

  const renderProduct = React.useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        setSelectedProduct(item);
        setModalVisible(true);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🍺</Text>
          </View>
        )}
        {item.stock <= 10 && item.stock > 0 && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Low Stock</Text>
          </View>
        )}
        {item.stock === 0 && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>₱{item.price.toFixed(2)}</Text>
          <Text style={[styles.productStock, item.stock > 0 ? styles.inStock : styles.outOfStock]}>
            {item.stock > 0 ? `${item.stock} left` : 'Sold Out'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🍺 Our Products</Text>
            <TouchableOpacity onPress={handleViewCart} style={styles.cartButton}>
              <Text style={styles.cartIcon}>🛒</Text>
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Browse our selection of craft beers</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories Horizontal Scroll */}
        <View style={styles.categoriesWrapper}>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === item && styles.categoryChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Products Grid */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
      </View>

      {/* Product Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            {selectedProduct && (
              <>
                <View style={styles.modalImageContainer}>
                  <Text style={styles.modalEmoji}>🍺</Text>
                </View>
                <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                <Text style={styles.modalCategory}>{selectedProduct.category}</Text>
                <Text style={styles.modalDescription}>{selectedProduct.description}</Text>
                <View style={styles.modalFooter}>
                  <Text style={styles.modalPrice}>₱{selectedProduct.price.toFixed(2)}</Text>
                  <Text style={[styles.modalStock, selectedProduct.stock > 0 ? styles.inStock : styles.outOfStock]}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.addToCartButton, selectedProduct.stock === 0 && styles.disabledButton]}
                  disabled={selectedProduct.stock === 0 || addingToCart}
                  onPress={handleAddToCart}
                >
                  <Text style={styles.addToCartText}>
                    {addingToCart ? 'Adding...' : selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#111827',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFD700',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  clearIcon: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  categoriesWrapper: {
    backgroundColor: '#0a0a0a',
    paddingBottom: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryChipActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 40) / 2,
    marginBottom: 16,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  lowStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lowStockText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 11,
    color: '#FFD700',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
    lineHeight: 14,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  productStock: {
    fontSize: 11,
  },
  inStock: {
    color: '#10B981',
  },
  outOfStock: {
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 24,
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#FFD700',
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalEmoji: {
    fontSize: 80,
  },
  modalProductName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalCategory: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  modalStock: {
    fontSize: 14,
  },
  addToCartButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
});

export default ProductsScreen;