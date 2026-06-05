import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { MembershipButton } from '../membership-button';

describe('MembershipButton', () => {
  it('does not render a join action for repository owners', () => {
    const { container } = render(
      <MembershipButton
        repositoryId="repo-1"
        isOwner
        isMember
        applicationStatus="none"
        canApply={false}
      />
    );

    expect(screen.queryByText('申请加入')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
