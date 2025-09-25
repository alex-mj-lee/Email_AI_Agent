'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import { useEmail } from '@/hooks/useEmail';
import { TicketCategory } from '@/lib/types';

// Form validation schema
const ticketSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(20, 'Message must be at least 20 characters long'),
  category: z.enum(['Refund', 'Payment', 'Invoice', 'Other'] as const),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function SubmitTicket() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Use the email hook
  const { createTicket } = useEmail();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  });

  const onSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true);
    try {
      await createTicket(data);
      setShowSuccessModal(true);
      reset();
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white shadow-sm rounded-lg p-6'>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Submit a Support Ticket
            </h1>
            <p className='mt-1 text-sm text-gray-600'>
              We're here to help! Please provide the details below and we'll get
              back to you as soon as possible.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Name Field */}
            <div>
              <label
                htmlFor='customerName'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Full Name *
              </label>
              <input
                type='text'
                id='customerName'
                {...register('customerName')}
                className={`block w-full rounded-md shadow-sm sm:text-sm  p-2 ${
                  errors.customerName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder='Enter your full name'
              />
              {errors.customerName && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor='customerEmail'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Email Address *
              </label>
              <input
                type='email'
                id='customerEmail'
                {...register('customerEmail')}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-2 ${
                  errors.customerEmail
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder='Enter your email address'
              />
              {errors.customerEmail && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.customerEmail.message}
                </p>
              )}
            </div>

            {/* Subject Field */}
            <div>
              <label
                htmlFor='subject'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Subject *
              </label>
              <input
                type='text'
                id='subject'
                {...register('subject')}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-2 ${
                  errors.subject
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder='Brief description of your issue'
              />
              {errors.subject && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Category Field */}
            <div>
              <label
                htmlFor='category'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Category *
              </label>
              <select
                id='category'
                {...register('category')}
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2'
              >
                <option value=''>Select a category</option>
                <option value='Refund'>Refund</option>
                <option value='Payment'>Payment</option>
                <option value='Invoice'>Invoice</option>
                <option value='Other'>Other</option>
              </select>
              {errors.category && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor='message'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Message *
              </label>
              <textarea
                id='message'
                rows={6}
                {...register('message')}
                className={`block w-full rounded-md shadow-sm sm:text-sm p-2 ${
                  errors.message
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder='Please provide detailed information about your issue...'
              />
              {errors.message && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.message.message}
                </p>
              )}
              <p className='mt-1 text-xs text-gray-500'>
                Minimum 20 characters required
              </p>
            </div>

            {/* Submit Button */}
            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <Transition.Root show={showSuccessModal} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => setShowSuccessModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed inset-0 z-10 overflow-y-auto'>
            <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6'>
                  <div>
                    <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                      <CheckIcon
                        className='h-6 w-6 text-green-600'
                        aria-hidden='true'
                      />
                    </div>
                    <div className='mt-3 text-center sm:mt-5'>
                      <Dialog.Title
                        as='h3'
                        className='text-lg font-semibold leading-6 text-gray-900'
                      >
                        Ticket Submitted Successfully!
                      </Dialog.Title>
                      <div className='mt-2'>
                        <p className='text-sm text-gray-500'>
                          Thank you for contacting us. We've received your
                          ticket and will respond as soon as possible.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='mt-5 sm:mt-6'>
                    <button
                      type='button'
                      className='inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      onClick={() => setShowSuccessModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
