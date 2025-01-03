module.exports.getPagesCost = (pages) => pages.split(',').reduce((acc, current) => {
  const subPages = current.split('-');
  if (subPages.length > 1) {
    const [initPage, endPage] = [subPages[0], subPages[1]];
    const numberOfPages = endPage - initPage + 1;
    acc += numberOfPages;
  } else {
    acc += 1;
  }
  return acc;
}, 0);

module.exports.getTotalPrice = (sales, pagesAmount) => {
  sales.sort((a, b) => a.unitPriceStartsOnPage - b.unitPriceStartsOnPage);
  const index = sales.findIndex(sale => pagesAmount < sale.unitPriceStartsOnPage);
  const sale = sales[index - 1];
  if (sale) return pagesAmount * sales[index - 1].unitPrice;
  return pagesAmount * sales[sales.length - 1].unitPrice;
}