// Simple keyword-based categorization
// In production, this could use ML models or more sophisticated matching

const categoryKeywords = {
  'Food & Dining': ['restaurant', 'cafe', 'food', 'grocery', 'supermarket', 'zomato', 'swiggy', 'uber eats', 'pizza', 'burger', 'coffee', 'tea', 'bakery', 'dining'],
  'Transportation': ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'diesel', 'metro', 'bus', 'train', 'parking', 'toll', 'transport'],
  'Utilities': ['electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'mobile', 'broadband', 'utility', 'bsnl', 'airtel', 'jio'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'shopping', 'store', 'mall', 'clothing', 'electronics', 'fashion'],
  'Entertainment': ['movie', 'cinema', 'netflix', 'prime', 'spotify', 'game', 'entertainment', 'streaming', 'theatre'],
  'Healthcare': ['hospital', 'clinic', 'pharmacy', 'medical', 'doctor', 'medicine', 'health', 'apollo', 'pharma'],
  'Education': ['course', 'tuition', 'book', 'education', 'school', 'college', 'university', 'learning'],
  'Bills & Payments': ['credit card', 'loan', 'emi', 'subscription', 'bill', 'payment', 'due', 'recharge'],
  'Travel': ['hotel', 'flight', 'travel', 'booking', 'trip', 'vacation', 'holiday', 'airbnb'],
};

function categorizeTransaction(description) {
  if (!description) return null;
  
  const desc = description.toLowerCase();
  
  // Check each category for keyword matches
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Other';
}

module.exports = { categorizeTransaction, categoryKeywords };

