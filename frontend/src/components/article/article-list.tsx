import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { withRouter } from 'react-router';

import { useActiveArticles } from '../../store';
import { startLoadingArticles, Article } from '../../store/reducers';
import { NavTabMenus } from '../common/nav-tab-menu';
import { SearchList } from '../common/search-list/search-list';
import { Link } from 'react-router-dom';
import { getArticleFormRoute } from './article-router';
import { Currency } from '../currency';
import { ArticleTagFilter } from './article-tag-filter';

import styles from './article-list.module.css';
import { Button, AddIcon, Flex } from '../../bricks';
import { useDispatch } from 'react-redux';

const ArticleListItem: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <Link className={styles.list} to={getArticleFormRoute(article.id)}>
      <span>{article.name}</span>
      <span>
        <Currency hidePlusSign value={article.amount} />
      </span>
    </Link>
  );
};

const AddArticleButton = withRouter((props) => {
  const intl = useIntl();
  return (
    <Button
      highlight
      title={intl.formatMessage({ id: 'ARTICLE_ADD_LINK' })}
      margin="0 1rem 0 0"
      onClick={() => props.history.push('/articles/add')}
      fab
    >
      <AddIcon />
    </Button>
  );
});

export const ArticleList: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const articles = useActiveArticles(isActive);
  const [filters, setFilters] = React.useState<string[]>([]);
  const dispatch = useDispatch();

  React.useEffect(() => {
    startLoadingArticles(dispatch, isActive);
  }, [dispatch, isActive]);

  const handleFilterChange = (filters: Record<string, string>) => {
    const filterQueries = Object.values(filters);
    setFilters(filterQueries);
  };

  const filterArticles = () => {
    if (filters.length) {
      return articles.filter((article) =>
        article.tags.some(({ tag }) => filters.includes(tag))
      );
    }
    return articles;
  };

  return (
    <div style={{ margin: '1.5rem 1rem' }}>
      <Flex alignContent="center" alignItems="center">
        <AddArticleButton />
        <NavTabMenus
          margin="0.5rem 0"
          breakpoint={0}
          label={<FormattedMessage id="ARTICLE_HEADLINE" />}
          tabs={[
            {
              to: '/articles/active',
              message: <FormattedMessage id="ARTICLE_ACTIVE_HEADLINE" />,
            },
            {
              to: '/articles/inactive',
              message: <FormattedMessage id="ARTICLE_INACTIVE_HEADLINE" />,
            },
          ]}
        />
      </Flex>
      <ArticleTagFilter onFilterChange={handleFilterChange} />
      <SearchList
        items={filterArticles()}
        renderItem={(article: Article) => (
          <ArticleListItem key={article.id} article={article} />
        )}
        pageSize={10}
      />
    </div>
  );
};
