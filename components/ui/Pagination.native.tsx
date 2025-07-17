import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'react-native-feather';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={currentPage === 1}
          accessibilityLabel="Previous page"
          style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        >
          <ChevronLeft width={24} height={24} color={currentPage === 1 ? '#9ca3af' : '#374151'} />
          <Text style={[styles.navButtonText, currentPage === 1 && styles.disabledText]}>Previous</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pagesContainer}>
          {pages.map((page) => (
            <TouchableOpacity
              key={page}
              onPress={() => onPageChange(page)}
              accessibilityLabel={`Page ${page}`}
              style={[
                styles.pageButton,
                page === currentPage ? styles.activePageButton : styles.inactivePageButton,
              ]}
            >
              <Text style={page === currentPage ? styles.activePageText : styles.inactivePageText}>{page}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={handleNext}
          disabled={currentPage === totalPages}
          accessibilityLabel="Next page"
          style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
        >
          <Text style={[styles.navButtonText, currentPage === totalPages && styles.disabledText]}>Next</Text>
          <ChevronRight width={24} height={24} color={currentPage === totalPages ? '#9ca3af' : '#374151'} />
        </TouchableOpacity>
      </View>
      <Text style={styles.pageInfo}>
        Page <Text style={styles.pageInfoBold}>{currentPage}</Text> of <Text style={styles.pageInfoBold}>{totalPages}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  navButtonText: {
    fontSize: 14,
    color: '#374151',
    marginHorizontal: 4,
  },
  disabledButton: {
    backgroundColor: '#e5e7eb',
  },
  disabledText: {
    color: '#9ca3af',
  },
  pagesContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
  },
  pageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activePageButton: {
    backgroundColor: '#2563eb',
  },
  inactivePageButton: {
    backgroundColor: '#f3f4f6',
  },
  activePageText: {
    color: '#fff',
    fontWeight: '600',
  },
  inactivePageText: {
    color: '#374151',
  },
  pageInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#374151',
  },
  pageInfoBold: {
    fontWeight: '600',
  },
});

export default Pagination;
