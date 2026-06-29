import {
  getDealerBySlug,
  getSortedDealers
} from '../../models/dealers/dealers.js';

const dealersListPage = async (req, res, next) => {
  try {
    const validSortOptions = ['name', 'location'];

    const sortBy = validSortOptions.includes(req.query.sort)
      ? req.query.sort
      : 'name';

    const dealers = await getSortedDealers(sortBy);

    res.render('dealers/list', {
      title: 'Dealers Directory',
      dealers,
      currentSort: sortBy
    });
  } catch (error) {
    next(error);
  }
};

const dealerDetailPage = async (req, res, next) => {
  try {
    const dealerSlug = req.params.dealerSlug;

    const dealer = await getDealerBySlug(dealerSlug);

    if (!dealer) {
      const err = new Error(`Dealer ${dealerSlug} not found`);
      err.status = 404;
      return next(err);
    }

    res.render('dealers/detail', {
      title: `${dealer.name} - Dealer Profile`,
      dealer
    });
  } catch (error) {
    next(error);
  }
};

export {
  dealersListPage,
  dealerDetailPage
};