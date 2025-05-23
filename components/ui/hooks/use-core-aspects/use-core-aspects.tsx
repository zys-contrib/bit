import { useDataQuery } from '@teambit/ui-foundation.ui.hooks.use-data-query';
import { gql } from '@apollo/client';

export type CoreAspectIdByPackageName = {
  [packageName: string]: string;
};

const GET_CORE_ASPECTS = gql`
  query CoreAspects {
    coreAspects
  }
`;

export function useCoreAspects(): CoreAspectIdByPackageName {
  // @ts-ignore - remove once graphql versions are aligned (see #8753)
  const { data } = useDataQuery(GET_CORE_ASPECTS);
  return data?.coreAspects;
}
