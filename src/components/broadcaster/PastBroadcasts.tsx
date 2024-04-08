import { useQueryClient } from '@tanstack/react-query'
import Button from 'components/Button'
import { usePastBroadcastsQuery } from 'hooks/broadcast'
import { useEffect, useRef, useState } from 'react'
import DateUtils from 'utils/date'

const PastBroadcasts = () => {
  const [selected, setSelected] = useState<number | undefined>()
  const [currentPage, setCurrentPage] = useState(0)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const queryClient = useQueryClient()
  const initialData = {
    pages: [queryClient.getQueryData(['broadcastDashboard'])],
    pageParams: [0]
  }
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePastBroadcastsQuery(initialData)

  const collapseBtnText = 'Collapse'
  let showMoreBtnText = 'Show more'
  if (isFetchingNextPage) {
    showMoreBtnText = 'Loading more...'
  }
  useEffect(() => {
    // Run only once when hasNextPage go from true to false
    if (data?.pages.length) {
      setCurrentPage(data.pages.length)
    }
  }, [data])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data, currentPage])

  const onLoadMore = () => {
    if (hasNextPage) {
      void fetchNextPage()
    } else {
      setCurrentPage(currentPage)
    }
  }

  const onCollapse = () => {
    setCurrentPage(1)
    setSelected(undefined)
  }
  const onSelect = (id: number) => (id === selected ? setSelected(undefined) : setSelected(id))

  return (
    <>
      <h2 className='mb-2 mt-7 text-lg'>Past batches</h2>
      <div className='dropdown mb-4'>
        {data?.pages.slice(0, hasNextPage ? data.pages.length : currentPage).map(group =>
          group.data.past.map(broadcast => (
            <div
              key={broadcast.id}
              className={`box box-collapsable !mt-1 ${selected === broadcast.id ? 'box-collapsable--opened' : ''}`}
              onClick={() => onSelect(broadcast.id)}
            >
              <div className='box-header columns-middle'>
                <span className='margin-right-small'>
                  <i className='icon icon-menu-right h-6 w-4'>
                    <svg className='h-4 w-4'>
                      <use xlinkHref='#menu-right' />
                    </svg>
                  </i>
                </span>
                <span className='column-grow ellipsis'>
                  <div className='flex items-center'>{DateUtils.format(broadcast.runAt)}</div>
                </span>
              </div>
              <div className='box-content'>
                <div>
                  {selected === broadcast.id && (
                    <div className='mx-3 text-sm'>
                      <p className='pt-3 font-medium'>
                        {broadcast.totalFirstSent} <span className='font-normal'>Total recipients</span>
                      </p>

                      <p className='pt-3 font-medium'>
                        {broadcast.totalSecondSent} <span className='font-normal'>Follow-up messages sent</span>
                      </p>

                      <p className='pt-3 font-medium'>
                        {broadcast.totalUnsubscribed} <span className='font-normal'>Unsubscribes</span>
                      </p>

                      <h3 className='pt-3 font-bold'>Conversation starter</h3>
                      <p id='firstMessage' className='bg-missive-light-border-color px-3 py-4 italic'>
                        {broadcast.firstMessage}
                      </p>
                      <h3 className='pt-3 font-bold'>Follow-up message</h3>
                      <p id='secondMessage' className='bg-missive-light-border-color px-3 py-4 italic'>
                        {broadcast.secondMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {selected ? (
          <Button
            text={collapseBtnText}
            onClick={onCollapse}
            className='bg-missive-background-color py-1 text-missive-blue-color  hover:!bg-rgba-missive-blue-color disabled:cursor-not-allowed disabled:opacity-50'
            disabled={isFetchingNextPage}
          />
        ) : (
          hasNextPage && (
            <Button
              text={showMoreBtnText}
              onClick={onLoadMore}
              className='bg-missive-background-color py-1 text-missive-blue-color hover:!bg-rgba-missive-blue-color disabled:cursor-not-allowed disabled:opacity-50'
              disabled={isFetchingNextPage}
            />
          )
        )}
      </div>
      <div ref={bottomRef} />
    </>
  )
}

export default PastBroadcasts
