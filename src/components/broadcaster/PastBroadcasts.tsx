import { useQueryClient } from '@tanstack/react-query'
import Button from 'components/Button'
import { usePastBroadcastsQuery } from 'hooks/broadcast'
import { Fragment, useEffect, useRef, useState } from 'react'
import { LiaCaretDownSolid, LiaCaretUpSolid } from 'react-icons/lia'
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
      setCurrentPage(currentPage + 1)
    }
  }

  const onCollapse = () => {
    setCurrentPage(1)
    setSelected(undefined)
  }
  const onSelect = (id: number) => (id === selected ? setSelected(undefined) : setSelected(id))

  return (
    <>
      <h2 className='mb-2 mt-1.5 font-bold'>Past batches</h2>
      <div className='dropdown mb-4'>
        {data?.pages.slice(0, hasNextPage ? data.pages.length : currentPage).map(group =>
          group.data.past.map(broadcast => (
            <Fragment key={broadcast.id}>
              <button
                key={broadcast.id}
                type='button'
                className='flex w-full rounded-md border bg-missive-light-border-color py-2'
                onClick={() => onSelect(broadcast.id)}
              >
                {selected === broadcast.id ? (
                  <LiaCaretUpSolid size={20} className='mx-2' />
                ) : (
                  <LiaCaretDownSolid size={19} className='mx-2' />
                )}
                <div className='flex items-center'>{DateUtils.format(broadcast.runAt)}</div>
              </button>
              {selected === broadcast.id && (
                <div className='mx-3 my-5 text-sm'>
                  <p className='font-bold'>
                    Total recipients: <span className='font-normal'>{broadcast.totalFirstSent}</span>
                  </p>
                  <p className='mt-2 font-bold'>
                    Follow-up messages sent: <span className='font-normal'>{broadcast.totalSecondSent}</span>
                  </p>
                  <p className='mt-2 font-bold'>
                    Unsubscribes: <span className='font-normal'>{broadcast.totalUnsubscribed}</span>
                  </p>
                  <h3 className='mt-2 font-bold'>Conversation starter</h3>
                  <p id='firstMessage' className='bg-missive-background-color px-3 py-4 italic'>
                    {broadcast.firstMessage}
                  </p>
                  <h3 className='mt-2 font-bold'>Follow-up message</h3>
                  <p id='secondMessage' className='bg-missive-background-color px-3 py-4 italic'>
                    {broadcast.secondMessage}
                  </p>
                </div>
              )}
            </Fragment>
          ))
        )}
        {selected ? (
          <Button
            text={collapseBtnText}
            onClick={onCollapse}
            className='bg-missive-background-color py-1 text-missive-blue-color disabled:cursor-not-allowed disabled:opacity-50'
            disabled={isFetchingNextPage}
          />
        ) : (
          hasNextPage && (
            <Button
              text={showMoreBtnText}
              onClick={onLoadMore}
              className='bg-missive-background-color py-1 text-missive-blue-color disabled:cursor-not-allowed disabled:opacity-50'
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
