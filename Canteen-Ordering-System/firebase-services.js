// Firebase Services for Canteen Ordering System

import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Order Service Class
export class OrderService {
  constructor(db) {
    this.db = db;
    this.ordersCollection = collection(db, 'orders');
  }

  // Save a new order
  async saveOrder(orderData) {
    try {
      // Generate a unique token (simple timestamp-based)
      const token = Date.now().toString().slice(-6);
      
      const orderWithTimestamp = {
        ...orderData,
        token: token,
        status: 'Pending',
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(this.ordersCollection, orderWithTimestamp);
      
      console.log('Order saved with ID:', docRef.id);
      
      // Schedule automatic status updates
      this.scheduleStatusUpdates(docRef.id);
      
      return {
        success: true,
        token: token,
        orderId: docRef.id
      };
    } catch (error) {
      console.error('Error saving order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all orders
  async getAllOrders() {
    try {
      const q = query(this.ordersCollection, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  // Get orders by phone number
  async getOrdersByPhone(phone) {
    try {
      const q = query(
        this.ordersCollection, 
        where('phone', '==', phone),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting orders by phone:', error);
      return [];
    }
  }

  // Update order status
  async updateOrderStatus(orderId, newStatus) {
    try {
      const orderRef = doc(this.db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      console.log('Order status updated to:', newStatus);
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate statistics
  async calculateStats() {
    try {
      const orders = await this.getAllOrders();
      
      if (orders.length === 0) {
        return {
          totalOrders: 0,
          totalProfit: 0,
          customerCount: 0,
          mostSoldItem: null,
          mostSoldCount: 0
        };
      }

      // Calculate total profit
      const totalProfit = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Count unique customers
      const uniquePhones = new Set(orders.map(order => order.phone));
      const customerCount = uniquePhones.size;
      
      // Find most sold item
      const itemCounts = {};
      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            itemCounts[item.item] = (itemCounts[item.item] || 0) + item.qty;
          });
        }
      });
      
      const mostSoldItem = Object.keys(itemCounts).reduce((a, b) => 
        itemCounts[a] > itemCounts[b] ? a : b, null);
      const mostSoldCount = mostSoldItem ? itemCounts[mostSoldItem] : 0;

      return {
        totalOrders: orders.length,
        totalProfit: totalProfit,
        customerCount: customerCount,
        mostSoldItem: mostSoldItem,
        mostSoldCount: mostSoldCount
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalOrders: 0,
        totalProfit: 0,
        customerCount: 0,
        mostSoldItem: null,
        mostSoldCount: 0
      };
    }
  }

  // Schedule automatic status updates
  scheduleStatusUpdates(orderId) {
    // Update to "Preparing" after 2 minutes
    setTimeout(async () => {
      try {
        await this.updateOrderStatus(orderId, 'Preparing');
      } catch (error) {
        console.error('Error updating to Preparing status:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes

    // Update to "Ready" after 5 minutes
    setTimeout(async () => {
      try {
        await this.updateOrderStatus(orderId, 'Ready');
      } catch (error) {
        console.error('Error updating to Ready status:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Real-time order updates (for admin dashboard)
  subscribeToOrders(callback) {
    const q = query(this.ordersCollection, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(orders);
    });
  }
}

// Menu Service Class
export class MenuService {
  constructor(db) {
    this.db = db;
    this.menuCollection = collection(db, 'menu');
  }

  // Initialize menu data if collection is empty
  async initializeMenuData() {
    try {
      const snapshot = await getDocs(this.menuCollection);
      
      if (snapshot.empty) {
        console.log('Initializing menu data...');
        
        const menuItems = [
          {
            name: 'Veg Sandwich',
            price: 40,
            category: 'Fast Foods',
            image: 'https://i.pinimg.com/1200x/07/d5/b9/07d5b9f9d5bc5d6b2922f863a701a709.jpg',
            description: 'Fresh vegetables in bread',
            available: true
          },
          {
            name: 'Pasta',
            price: 70,
            category: 'Fast Foods',
            image: 'https://i.pinimg.com/1200x/9c/3b/72/9c3b7274384a0bab197fd68115a395ff.jpg',
            description: 'Italian pasta with sauce',
            available: true
          },
          {
            name: 'Cheese Burger',
            price: 90,
            category: 'Fast Foods',
            image: 'https://i.pinimg.com/736x/ae/a7/76/aea77686ef7abd6b426332cf3018e095.jpg',
            description: 'Juicy burger with cheese',
            available: true
          },
          {
            name: 'Margherita Pizza',
            price: 120,
            category: 'Fast Foods',
            image: 'https://i.pinimg.com/736x/37/b6/60/37b660cb40988dda83c8d345f62c83da.jpg',
            description: 'Classic pizza with tomato and cheese',
            available: true
          },
          {
            name: 'Cold Coffee',
            price: 50,
            category: 'Beverages',
            image: 'https://i.pinimg.com/736x/a6/1a/11/a61a116c38ab125d93f3c67aff74a07e.jpg',
            description: 'Refreshing cold coffee',
            available: true
          },
          {
            name: 'Masala Chai',
            price: 20,
            category: 'Beverages',
            image: 'https://i.pinimg.com/736x/1e/54/af/1e54afeaa85c39ac3464a613b911e61e.jpg',
            description: 'Traditional spiced tea',
            available: true
          },
          {
            name: 'French Fries',
            price: 60,
            category: 'Snacks',
            image: 'https://i.pinimg.com/736x/93/51/04/93510488228f49d24ccb4b271c28fc4b.jpg',
            description: 'Crispy golden fries',
            available: true
          },
          {
            name: 'Hakka Noodles',
            price: 80,
            category: 'Chinese',
            image: 'https://i.pinimg.com/1200x/85/09/10/850910eeb1283265cdded6dc94107ba4.jpg',
            description: 'Stir-fried noodles with vegetables',
            available: true
          },
          {
            name: 'Masala Dosa',
            price: 70,
            category: 'South Indian',
            image: 'https://i.pinimg.com/1200x/d9/28/98/d928988009de3cd9e90c68cbb3acdd02.jpg',
            description: 'Crispy dosa with potato filling',
            available: true
          },
          {
            name: 'Idli Sambar',
            price: 50,
            category: 'South Indian',
            image: 'https://i.pinimg.com/736x/c3/87/f5/c387f5c4a82802b5c138d0ab6dd84d8d.jpg',
            description: 'Soft idlis with sambar',
            available: true
          },
          {
            name: 'Fried Rice',
            price: 90,
            category: 'Chinese',
            image: 'https://i.pinimg.com/1200x/3a/3a/82/3a3a8206a0eb3f5e3c7c029619ab866d.jpg',
            description: 'Vegetable fried rice',
            available: true
          },
          {
            name: 'Tomato Soup',
            price: 40,
            category: 'Beverages',
            image: 'https://i.pinimg.com/1200x/ca/ec/45/caec45f62f12c720d17b14dfc2ae61eb.jpg',
            description: 'Hot tomato soup',
            available: true
          }
        ];

        // Add each menu item to Firestore
        for (const item of menuItems) {
          await addDoc(this.menuCollection, {
            ...item,
            createdAt: serverTimestamp()
          });
        }
        
        console.log('Menu data initialized successfully');
      } else {
        console.log('Menu data already exists');
      }
    } catch (error) {
      console.error('Error initializing menu data:', error);
    }
  }

  // Get all menu items
  async getAllMenuItems() {
    try {
      const q = query(this.menuCollection, where('available', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting menu items:', error);
      return [];
    }
  }

  // Search menu items
  async searchMenuItems(searchTerm) {
    try {
      const allItems = await this.getAllMenuItems();
      const searchLower = searchTerm.toLowerCase();
      
      return allItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching menu items:', error);
      return [];
    }
  }

  // Get menu items by category
  async getMenuItemsByCategory(category) {
    try {
      const q = query(
        this.menuCollection, 
        where('category', '==', category),
        where('available', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting menu items by category:', error);
      return [];
    }
  }

  // Add new menu item
  async addMenuItem(itemData) {
    try {
      const docRef = await addDoc(this.menuCollection, {
        ...itemData,
        available: true,
        createdAt: serverTimestamp()
      });
      
      console.log('Menu item added with ID:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding menu item:', error);
      return { success: false, error: error.message };
    }
  }

  // Update menu item
  async updateMenuItem(itemId, updateData) {
    try {
      const itemRef = doc(this.db, 'menu', itemId);
      await updateDoc(itemRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      console.log('Menu item updated:', itemId);
      return { success: true };
    } catch (error) {
      console.error('Error updating menu item:', error);
      return { success: false, error: error.message };
    }
  }
}

