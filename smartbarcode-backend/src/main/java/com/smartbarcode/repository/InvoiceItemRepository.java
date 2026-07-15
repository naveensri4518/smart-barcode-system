package com.smartbarcode.repository;

import com.smartbarcode.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    @Query("SELECT ii.product.id, ii.product.name, SUM(ii.quantity) as totalQty, SUM(ii.subtotal) as totalRevenue " +
           "FROM InvoiceItem ii JOIN ii.invoice i " +
           "WHERE i.status = 'COMPLETED' AND i.createdAt >= :startDate " +
           "GROUP BY ii.product.id, ii.product.name " +
           "ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProducts(@Param("startDate") LocalDateTime startDate, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT ii.product.id, ii.product.name, ii.product.currentStock, SUM(ii.quantity) as totalQty " +
           "FROM InvoiceItem ii JOIN ii.invoice i " +
           "WHERE i.status = 'COMPLETED' AND i.createdAt >= :startDate " +
           "GROUP BY ii.product.id, ii.product.name, ii.product.currentStock")
    List<Object[]> getProductSalesVelocity(@Param("startDate") LocalDateTime startDate);
}
