import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSearchDto, SearchType } from '../src/search/dto';
import { QuerySearchHistoryDto } from '../src/search/dto/search-history.dto';

describe('Search DTO validation', () => {
  it('accepts Prisma cuid repository ids for creating searches', async () => {
    const dto = plainToInstance(CreateSearchDto, {
      repositoryId: 'cmq0h372b0001uku77twxrv1r',
      query: 'greet',
      searchType: SearchType.CONTENT,
      maxResults: 100,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects empty repository ids for creating searches', async () => {
    const dto = plainToInstance(CreateSearchDto, {
      repositoryId: '',
      query: 'greet',
      searchType: SearchType.CONTENT,
    });

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'repositoryId' }),
      ])
    );
  });

  it('accepts Prisma cuid repository ids for search history filters', async () => {
    const dto = plainToInstance(QuerySearchHistoryDto, {
      repositoryId: 'cmq0h372b0001uku77twxrv1r',
      page: '1',
      limit: '20',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
